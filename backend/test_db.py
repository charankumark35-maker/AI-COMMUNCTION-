from app.database.session import engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_connection():
    try:
        # Try to connect to the database and execute a simple query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            for row in result:
                logger.info("Successfully connected to the database!")
                return True
    except Exception as e:
        logger.error(f"Failed to connect to the database: {e}")
        return False

if __name__ == "__main__":
    test_connection()
