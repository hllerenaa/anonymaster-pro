import psycopg2
from psycopg2.extras import RealDictCursor, Json
from psycopg2.pool import SimpleConnectionPool
import json
import logging
from typing import Dict, List, Optional, Any
from contextlib import contextmanager
import os

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, credentials: Dict):
        self.credentials = credentials
        self.pool = None
        self._initialize_pool()

    def _initialize_pool(self):
        try:
            db_config = self.credentials['database']
            self.pool = SimpleConnectionPool(
                minconn=1,
                maxconn=10,
                host=db_config['host'],
                port=db_config['port'],
                user=db_config['user'],
                password=db_config['password'],
                database=db_config['database']
            )
            logger.info(f"Database pool initialized: {db_config['host']}:{db_config['port']}/{db_config['database']}")
        except Exception as e:
            logger.error(f"Failed to initialize database pool: {str(e)}")
            raise

    @contextmanager
    def get_connection(self):
        conn = self.pool.getconn()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {str(e)}")
            raise
        finally:
            self.pool.putconn(conn)

    def execute_query(self, query: str, params: tuple = None, fetch: bool = False) -> Optional[List[Dict]]:
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                if fetch:
                    return [dict(row) for row in cursor.fetchall()]
                return None

    def execute_one(self, query: str, params: tuple = None) -> Optional[Dict]:
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                result = cursor.fetchone()
                return dict(result) if result else None

    def insert_returning(self, table: str, data: Dict) -> Dict:
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        values = tuple(data.values())

        query = f"""
            INSERT INTO {table} ({columns})
            VALUES ({placeholders})
            RETURNING *
        """

        return self.execute_one(query, values)

    def select(self, table: str, filters: Dict = None, order_by: str = None, limit: int = None) -> List[Dict]:
        query = f"SELECT * FROM {table}"
        params = []

        if filters:
            conditions = []
            for key, value in filters.items():
                conditions.append(f"{key} = %s")
                params.append(value)
            query += " WHERE " + " AND ".join(conditions)

        if order_by:
            query += f" ORDER BY {order_by}"

        if limit:
            query += f" LIMIT {limit}"

        return self.execute_query(query, tuple(params) if params else None, fetch=True)

    def select_one(self, table: str, filters: Dict) -> Optional[Dict]:
        results = self.select(table, filters, limit=1)
        return results[0] if results else None

    def update(self, table: str, data: Dict, filters: Dict) -> Dict:
        set_clause = ', '.join([f"{key} = %s" for key in data.keys()])
        where_clause = ' AND '.join([f"{key} = %s" for key in filters.keys()])

        values = tuple(list(data.values()) + list(filters.values()))

        query = f"""
            UPDATE {table}
            SET {set_clause}
            WHERE {where_clause}
            RETURNING *
        """

        return self.execute_one(query, values)

    def delete(self, table: str, filters: Dict) -> bool:
        where_clause = ' AND '.join([f"{key} = %s" for key in filters.keys()])
        values = tuple(filters.values())

        query = f"DELETE FROM {table} WHERE {where_clause}"

        try:
            self.execute_query(query, values)
            return True
        except:
            return False

    def close(self):
        if self.pool:
            self.pool.closeall()
            logger.info("Database pool closed")

def load_credentials():
    credentials_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'credentials.json')

    if not os.path.exists(credentials_path):
        raise FileNotFoundError(f"Credentials file not found: {credentials_path}")

    with open(credentials_path, 'r', encoding='utf-8') as f:
        credentials = json.load(f)

    logger.info("Credentials loaded successfully")
    return credentials

_db_instance = None

def get_database() -> Database:
    global _db_instance
    if _db_instance is None:
        credentials = load_credentials()
        _db_instance = Database(credentials)
    return _db_instance
