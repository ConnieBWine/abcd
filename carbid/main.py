from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr, constr
from typing import Optional, Union, List, Dict, Any
from pathlib import Path
import pymysql
import hashlib
import bcrypt
import shutil 
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from web3 import Web3
from web3.exceptions import InvalidAddress, ContractLogicError
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv
import json
import os
import logging

# Load environment variables
load_dotenv()

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
CONTRACT_ABI_PATH = BASE_DIR / 'src' / 'VehicleHistory.json'
SERVICE_CENTER_AUTH_PATH = BASE_DIR / 'ServiceCenterAuth.json'

# Initialize Web3
try:
    # Initialize Web3 connection
    w3 = Web3(Web3.HTTPProvider(os.getenv('GANACHE_URL', 'http://127.0.0.1:7545')))
    if not w3.is_connected():
        logger.error("Could not connect to Ethereum node")
        raise Exception("Could not connect to Ethereum node")
    logger.info(f"Connected to Ethereum node at {w3.provider.endpoint_uri}")

    # Initialize VehicleHistory Contract
    VEHICLE_HISTORY_ADDRESS = os.getenv('VEHICLE_HISTORY_CONTRACT_ADDRESS')
    if not VEHICLE_HISTORY_ADDRESS:
        raise ValueError("VEHICLE_HISTORY_CONTRACT_ADDRESS not found in environment variables")
    
    VEHICLE_HISTORY_ADDRESS = Web3.to_checksum_address(VEHICLE_HISTORY_ADDRESS)
    
    # Load VehicleHistory contract ABI
    if not CONTRACT_ABI_PATH.exists():
        raise FileNotFoundError(f"VehicleHistory ABI file not found at {CONTRACT_ABI_PATH}")
        
    with open(CONTRACT_ABI_PATH) as f:
        vehicle_history_abi = json.load(f)
        if not isinstance(vehicle_history_abi, list):
            raise ValueError(f"Invalid ABI format in {CONTRACT_ABI_PATH}. Expected a list of ABI entries.")
    
    # Initialize VehicleHistory contract
    vehicle_history_contract = w3.eth.contract(
        address=VEHICLE_HISTORY_ADDRESS,
        abi=vehicle_history_abi
    )
    
    logger.info("VehicleHistory contract initialized successfully")

    # Initialize ServiceCenterAuth Contract
    SERVICE_CENTER_AUTH_ADDRESS = os.getenv('SERVICE_CENTER_AUTH_ADDRESS')
    if not SERVICE_CENTER_AUTH_ADDRESS:
        raise ValueError("SERVICE_CENTER_AUTH_ADDRESS not found in environment variables")
    
    SERVICE_CENTER_AUTH_ADDRESS = Web3.to_checksum_address(SERVICE_CENTER_AUTH_ADDRESS)
    
    # Load ServiceCenterAuth contract ABI
    if not SERVICE_CENTER_AUTH_PATH.exists():
        raise FileNotFoundError(f"ServiceCenterAuth ABI file not found at {SERVICE_CENTER_AUTH_PATH}")
        
    with open(SERVICE_CENTER_AUTH_PATH) as f:
        service_center_abi = json.load(f)
    
    # Initialize ServiceCenterAuth contract
    service_center_contract = w3.eth.contract(
        address=SERVICE_CENTER_AUTH_ADDRESS,
        abi=service_center_abi
    )
    
    logger.info("ServiceCenterAuth contract initialized successfully")

except FileNotFoundError as e:
    logger.error(f"Contract file error: {e}")
    raise SystemExit(f"Application cannot start: {e}")
except ValueError as e:
    logger.error(f"Configuration error: {e}")
    raise SystemExit(f"Application cannot start: {e}")
except Exception as e:
    logger.error(f"Initialization error: {e}")
    raise SystemExit(f"Application cannot start: {e}")


app = FastAPI()

@app.middleware("http")
async def log_requests(request, call_next):
    try:
        response = await call_next(request)
        if response.status_code >= 400:
            logger.error(f"Request failed: {request.method} {request.url} - Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request error: {str(e)}")
        raise
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
# Create required directories
BASE_DIR = Path(__file__).resolve().parent
ASSETS_DIR = BASE_DIR / "assets"
UPLOADS_DIR = BASE_DIR / "uploads"
PUBLIC_DIR = BASE_DIR / "public"
SERVICE_RECORDS_DIR = UPLOADS_DIR / "service-records"
CONTRACT_ABI_PATH = BASE_DIR / 'VehicleHistory.json'
CONTRACT_PATH = BASE_DIR / 'ServiceCenterAuth.json'

# Create directories if they don't exist
for directory in [UPLOADS_DIR, SERVICE_RECORDS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)
    # Set proper permissions (Unix-like systems)
    if os.name == 'posix':
        os.chmod(directory, 0o755)

def load_contract_abi(file_path: Path) -> List[Dict[str, Any]]:
    """
    Load and validate contract ABI from JSON file.
    Returns the ABI array or raises an exception if invalid.
    """
    logger.info(f"Loading contract ABI from {file_path}")
    
    try:
        with open(file_path) as f:
            content = json.load(f)
            
        # Handle different JSON structures
        if isinstance(content, list):
            # If content is already a list (full ABI), return it directly
            return [item for item in content if isinstance(item, dict) and 'type' in item]
        elif isinstance(content, dict):
            if 'abi' in content:
                # If content has an 'abi' key, return that array
                return content['abi']
            elif 'contractName' in content and 'abi' in content:
                # If it's a full Truffle/Hardhat compiled output
                return content['abi']
        
        raise ValueError(f"Invalid ABI format in {file_path}")
            
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from {file_path}: {e}")
        raise
    except Exception as e:
        logger.error(f"Error loading ABI from {file_path}: {e}")
        raise
# Initialize Web3 and Contract
try:
    # Initialize Web3
    w3 = Web3(Web3.HTTPProvider(os.getenv('GANACHE_URL', 'http://127.0.0.1:7545')))
    if not w3.is_connected():
        logger.error("Could not connect to Ethereum node")
        raise Exception("Could not connect to Ethereum node")
    logger.info(f"Connected to Ethereum node at {w3.provider.endpoint_uri}")
    
    # Get ServiceCenterAuth contract address
    SERVICE_CENTER_AUTH_ADDRESS = os.getenv('SERVICE_CENTER_AUTH_ADDRESS')
    if not SERVICE_CENTER_AUTH_ADDRESS:
        logger.error("SERVICE_CENTER_AUTH_ADDRESS not found in environment variables")
        raise ValueError("SERVICE_CENTER_AUTH_ADDRESS not found in environment variables")
    
    # Convert to checksum address
    SERVICE_CENTER_AUTH_ADDRESS = Web3.to_checksum_address(SERVICE_CENTER_AUTH_ADDRESS)
    logger.info(f"Using ServiceCenterAuth contract address: {SERVICE_CENTER_AUTH_ADDRESS}")
    
    # Check if contract file exists
    if not CONTRACT_PATH.exists():
        logger.error(f"Contract ABI file not found at {CONTRACT_PATH}")
        raise FileNotFoundError(f"Contract ABI file not found at {CONTRACT_PATH}")
    
    # Load and validate contract ABI
    contract_abi = load_contract_abi(CONTRACT_PATH)
    
    # Initialize ServiceCenterAuth contract
    service_center_contract = w3.eth.contract(
        address=SERVICE_CENTER_AUTH_ADDRESS,
        abi=contract_abi
    )
    
    # Verify contract initialization with a safer test call
    try:
        # First verify if we can call the owner function which exists in the contract
        owner = service_center_contract.functions.owner().call()
        logger.info(f"Contract owner address: {owner}")
        
        # Try to check authorization for a test address
        test_addr = w3.eth.accounts[0]
        try:
            is_auth = service_center_contract.functions.isAuthorized(test_addr).call()
            logger.info(f"Contract test call successful. Test address {test_addr} auth status: {is_auth}")
        except ContractLogicError as e:
            # This is expected if the address is not authorized
            logger.info(f"Contract access check completed (address not authorized): {test_addr}")
            
    except Exception as e:
        logger.error(f"Contract test call failed: {e}")
        raise Exception(f"Contract test call failed: {e}")

    logger.info("Contract initialized successfully")
    
except FileNotFoundError as e:
    logger.error(f"Contract file error: {e}")
    raise SystemExit(f"Application cannot start: {e}")
except ValueError as e:
    logger.error(f"Configuration error: {e}")
    raise SystemExit(f"Application cannot start: {e}")
except Exception as e:
    logger.error(f"Initialization error: {e}")
    raise SystemExit(f"Application cannot start: {e}")

# Update mount points
app.mount("/assets", StaticFiles(directory="assets"), name="assets")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
DB_CONFIG = {
    "host": os.getenv('DB_HOST'),
    "user": os.getenv('DB_USER'),
    "password": os.getenv('DB_PASSWORD'),
    "db": os.getenv('DB_NAME'),
    "charset": "utf8mb4"
}

def initialize_web3_contract():
    """
    Initializes the Web3 contract with proper error handling
    """
    CONTRACT_ADDRESS = validate_ethereum_address(
        os.getenv('VEHICLE_HISTORY_CONTRACT_ADDRESS')
    )
    
    contract_path = BASE_DIR / 'ServiceCenterAuth.json'
    if not contract_path.exists():
        raise FileNotFoundError("Contract ABI file not found")
        
    with open(contract_path) as f:
        contract_abi = json.load(f)
    
    return w3.eth.contract(
        address=CONTRACT_ADDRESS,
        abi=contract_abi
    )

@app.on_event("startup")
async def startup_event():
    try:
        print("Starting application initialization...")
        
        # Validate environment variables first
        validate_environment_variables()
        
        # Initialize web3 connection
        if not w3.is_connected():
            raise Exception("Could not connect to Ethereum node")
        print(f"Connected to Ethereum node: {w3.provider.endpoint_uri}")
        
        # Get the contract address
        contract_address = os.getenv('SERVICE_CENTER_AUTH_ADDRESS')
        if not contract_address:
            raise Exception("SERVICE_CENTER_AUTH_ADDRESS not found in environment")
        
        contract_address = Web3.to_checksum_address(contract_address)
        print(f"Using contract address: {contract_address}")
        
        # Load contract ABI
        contract_path = BASE_DIR / 'ServiceCenterAuth.json'
        if not contract_path.exists():
            raise Exception("Contract ABI file not found")
            
        with open(contract_path) as f:
            contract_json = json.load(f)
            if isinstance(contract_json, list):
                contract_abi = contract_json
            else:
                contract_abi = contract_json.get('abi')
            
            if not contract_abi:
                raise Exception("Invalid contract ABI format")
        
        global contract
        # Initialize contract
        contract = w3.eth.contract(
            address=contract_address,
            abi=contract_abi
        )
        
        # Test contract call - Try owner() first as it's a view function
        try:
            owner = contract.functions.owner().call()
            print(f"Contract test call successful. Owner address: {owner}")
            
            # Now test authorization for a test address
            test_addr = w3.eth.accounts[0]
            try:
                is_auth = contract.functions.isAuthorized(test_addr).call()
                print(f"Authorization check successful. Address {test_addr} auth status: {is_auth}")
            except ContractLogicError:
                # This is expected if the address is not authorized
                print(f"Authorization check completed (address not authorized): {test_addr}")
                
        except Exception as e:
            raise Exception(f"Contract test call failed: {str(e)}")

        print("Contract initialized successfully")

        # Create required directories
        for directory in [UPLOADS_DIR, ASSETS_DIR, PUBLIC_DIR]:
            directory.mkdir(parents=True, exist_ok=True)
            print(f"Directory verified: {directory}")

        print("All systems initialized successfully")

    except Exception as e:
        print(f"Startup error: {str(e)}")
        raise SystemExit(f"Application cannot start: {e}")
    
app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.mount("/public", StaticFiles(directory=str(PUBLIC_DIR)), name="public")

# User dependency function
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("""
            SELECT id, email, name, status
            FROM users
            WHERE id = %s AND status = 'active'
        """, (user_id,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user is None:
            raise credentials_exception
            
        return user
        
    except jwt.PyJWTError:
        raise credentials_exception
    
# Mount static directories
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")
app.mount("/images", StaticFiles(directory=str(PUBLIC_DIR / "images")), name="public")

# JWT Configuration
SECRET_KEY = "your-secret-key"  # Change this to a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# At the top of your main.py, after imports
def validate_environment_variables():
    required_vars = [
        'VEHICLE_HISTORY_CONTRACT_ADDRESS',
        'SERVICE_CENTER_AUTH_ADDRESS',
        'GANACHE_URL',
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
            
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

# After loading environment variables
load_dotenv()

# Validate environment variables before initializing contract
try:
    validate_environment_variables()
    CONTRACT_ADDRESS = os.getenv('VEHICLE_HISTORY_CONTRACT_ADDRESS')
    CONTRACT_ADDRESS = Web3.to_checksum_address(CONTRACT_ADDRESS)
    
    # Initialize contract
    contract_path = BASE_DIR / 'ServiceCenterAuth.json'
    with open(contract_path) as f:
        contract_abi = json.load(f)
    
    contract = w3.eth.contract(
        address=CONTRACT_ADDRESS,
        abi=contract_abi
    )
    print("Contract initialized successfully")
    
except ValueError as e:
    print(f"Environment validation error: {str(e)}")
    raise SystemExit("Application cannot start due to missing environment variables")
except Exception as e:
    print(f"Error initializing contract: {str(e)}")
    raise SystemExit(f"Application cannot start: {str(e)}")

# Database connection
def get_db_connection():
    return pymysql.connect(**DB_CONFIG)

class ServiceRecordRequest(BaseModel):
    service_type: str
    description: str
    mileage: str
    wallet_address: str

    class Config:
        schema_extra = {
            "example": {
                "service_type": "oil_change",
                "description": "Regular oil change service",
                "mileage": "50000",
                "wallet_address": "0x123..."
            }
        }

class VehicleListing(BaseModel):
    title: str
    description: str
    price: float
    saleType: str
    auctionDuration: Optional[int]
    startingBid: Optional[float]
    images: List[UploadFile]

# Models
class Vehicle(BaseModel):
    vin: str
    make: str
    model: str
    year: int
    price: float
    description: str
    owner_address: str

class ServiceRecordInput(BaseModel):
    serviceType: str
    description: str
    mileage: str
    wallet_address: str

class ServiceRecordCreate(BaseModel):
    vin: constr(min_length=1)  # Ensure VIN is not empty
    serviceType: constr(min_length=1)
    description: constr(min_length=1)
    mileage: int
    wallet_address: constr(min_length=42, max_length=42) 

class ServiceRecord(BaseModel):
    service_type: str
    description: str
    mileage: str
    service_center_id: Optional[str] = None
    service_center_name: Optional[str] = None
    document_paths: Optional[str] = None
    status: Optional[str] = 'completed'

# User Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Authentication functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


# Test database connection function
@app.get("/api/test-connection")
async def test_connection():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        return {"status": "success", "message": "Database connection successful"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection failed: {str(e)}"
        )

# Health check endpoint
@app.get("/")
async def health_check():
    return {"status": "healthy", "message": "Server is running"}

@app.post("/api/vehicles")
async def create_vehicle_listing(
    title: str = Form(...),
    description: str = Form(...),
    price: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    year: str = Form(...),
    mileage: str = Form(...),
    fuel_type: str = Form(...),
    transmission: str = Form(...),
    color: str = Form(...),
    location: str = Form(...),
    saleType: str = Form(...),
    auctionDuration: Optional[str] = Form(None),
    startingBid: Optional[str] = Form(None),
    images: List[UploadFile] = File(...)
):
    conn = None
    try:
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Start transaction
        conn.begin()

        try:
            # First, insert the vehicle listing
            insert_query = """
                INSERT INTO vehicle_listings (
                    title, description, price, make, model, year,
                    mileage, fuel_type, transmission, color, location,
                    sale_type, auction_duration, starting_bid, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            current_time = datetime.now()
            
            values = (
                title,
                description,
                float(price) if price else None,
                make,
                model,
                int(year),
                int(mileage),
                fuel_type,
                transmission,
                color,
                location,
                saleType,
                int(auctionDuration) if auctionDuration else None,
                float(startingBid) if startingBid else None,
                current_time
            )
            
            # Execute the insert
            cursor.execute(insert_query, values)
            
            # Get the ID of the newly created listing
            vehicle_id = cursor.lastrowid

            # Create directory for images
            vehicle_dir = UPLOADS_DIR / "vehicles" / str(vehicle_id) / "images"
            os.makedirs(vehicle_dir, exist_ok=True)

            # Process and save images
            saved_images = []
            for idx, image in enumerate(images):
                # Generate filename
                ext = os.path.splitext(image.filename)[1].lower() or '.jpg'
                filename = f"image_{idx}{ext}"
                file_path = vehicle_dir / filename

                # Save the image file
                contents = await image.read()
                with open(file_path, "wb") as f:
                    f.write(contents)

                # Create the database record
                rel_path = f"vehicles/{vehicle_id}/images/{filename}"
                
                # Insert image record
                cursor.execute("""
                    INSERT INTO vehicle_images (
                        vehicle_id, image_path, image_order, is_primary, created_at
                    ) VALUES (%s, %s, %s, %s, %s)
                """, (
                    vehicle_id,
                    rel_path,
                    idx,
                    idx == 0,
                    current_time
                ))

                saved_images.append({
                    "path": rel_path,
                    "url": f"/uploads/{rel_path}"
                })

            # Commit the transaction
            conn.commit()

            return {
                "success": True,
                "vehicle_id": vehicle_id,
                "images": saved_images
            }

        except Exception as db_error:
            # Rollback in case of error
            if conn:
                conn.rollback()
            print(f"Database error: {str(db_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(db_error)}"
            )

    except Exception as e:
        print(f"Error creating listing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

    finally:
        # Close the database connection
        if conn:
            conn.close()

@app.post("/api/vehicles/{token_id}/images")
async def upload_vehicle_images(token_id: int, files: List[UploadFile] = File(...)):
    try:
        image_hashes = []
        for file in files:
            # Read and hash file content
            content = await file.read()
            file_hash = hashlib.sha256(content).hexdigest()
            
            # Save file
            file_path = f"uploads/{token_id}/{file_hash}.jpg"
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Store in database
            conn = get_db_connection()
            cursor = conn.cursor()
            sql = """INSERT INTO vehicle_images 
                    (token_id, image_hash, image_path) 
                    VALUES (%s, %s, %s)"""
            cursor.execute(sql, (token_id, file_hash, file_path))
            conn.commit()
            
            image_hashes.append(file_hash)
            
        return {"success": True, "image_hashes": image_hashes}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/vehicles")
async def get_vehicles(sale_type: str = None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        query = """
            SELECT 
                vl.*,
                GROUP_CONCAT(vi.image_path) as image_paths
            FROM vehicle_listings vl
            LEFT JOIN vehicle_images vi ON vl.id = vi.vehicle_id
        """
        
        where_clauses = []
        params = []
        
        if sale_type and sale_type != 'all':
            where_clauses.append("vl.sale_type = %s")
            params.append(sale_type)
            
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            
        query += " GROUP BY vl.id ORDER BY vl.created_at DESC"
        
        cursor.execute(query, params)
        vehicles = cursor.fetchall()
        
        # Process the results
        for vehicle in vehicles:
            if vehicle['image_paths']:
                paths = vehicle['image_paths'].split(',')
                vehicle['images'] = [
                    {
                        "path": path.strip(),
                        "url": f"/uploads/{path.strip()}"
                    } for path in paths if path and path.strip()
                ]
            else:
                vehicle['images'] = []
            
            del vehicle['image_paths']
            
        return vehicles
        
    except Exception as e:
        print(f"Error fetching vehicles: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        if 'conn' in locals():
            conn.close()

@app.get("/api/vehicles/{token_id}")
async def get_vehicle(token_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Get vehicle data
        cursor.execute("SELECT * FROM vehicles WHERE token_id = %s", (token_id,))
        vehicle = cursor.fetchone()
        
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
            
        # Get images
# Get images
        cursor.execute("SELECT image_hash, image_path FROM vehicle_images WHERE token_id = %s", (token_id,))
        images = cursor.fetchall()
        vehicle['images'] = images
        
        # Get service records
        cursor.execute("SELECT * FROM service_records WHERE token_id = %s ORDER BY service_date DESC", (token_id,))
        service_records = cursor.fetchall()
        vehicle['service_records'] = service_records
        
        # Get blockchain data
        blockchain_data = vehicle_nft_contract.functions.getVehicle(token_id).call()
        vehicle['blockchain_price'] = blockchain_data[5]
        vehicle['is_for_sale'] = blockchain_data[6]
        
        return vehicle
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# @app.post("/api/vehicles/{token_id}/service-records")
# async def add_service_record(token_id: int, record: ServiceRecord):
#     try:
#         # Add to blockchain
#         tx_hash = vehicle_history_contract.functions.addServiceRecord(
#             token_id,
#             record.service_type,
#             record.description,
#             record.mileage,
#             ""  # document URI
#         ).transact({'from': record.service_center_id})
        
#         # Wait for transaction receipt
#         tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
#         # Store in database
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         sql = """INSERT INTO service_records 
#                 (token_id, service_type, description, mileage, service_center_id) 
#                 VALUES (%s, %s, %s, %s, %s)"""
                
#         cursor.execute(sql, (
#             token_id,
#             record.service_type,
#             record.description,
#             record.mileage,
#             record.service_center_id
#         ))
        
#         conn.commit()
#         return {"success": True}
        
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/vehicles/{token_id}/sell")
async def list_vehicle_for_sale(token_id: int, price: float, seller_address: str):
    try:
        # Convert price to wei
        price_wei = int(price * 1e18)
        
        # Approve marketplace contract
        tx_hash = vehicle_nft_contract.functions.approve(
            MARKETPLACE_ADDRESS,
            token_id
        ).transact({'from': seller_address})
        
        w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # List on marketplace
        tx_hash = marketplace_contract.functions.listVehicle(
            token_id,
            price_wei
        ).transact({'from': seller_address})
        
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {"success": True}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/vehicles/{token_id}/buy")
async def buy_vehicle(token_id: int, buyer_address: str):
    try:
        # Get listing price
        listing = marketplace_contract.functions.listings(token_id).call()
        
        # Buy vehicle
        tx_hash = marketplace_contract.functions.buyVehicle(
            token_id
        ).transact({
            'from': buyer_address,
            'value': listing[1]  # price in wei
        })
        
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Update database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = "UPDATE vehicles SET owner_address = %s WHERE token_id = %s"
        cursor.execute(sql, (buyer_address, token_id))
        
        conn.commit()
        return {"success": True}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Authentication endpoints
@app.post("/api/register", response_model=dict)
async def register_user(user: UserCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = get_password_hash(user.password)
        
        # Get current timestamp
        current_time = datetime.utcnow()

        # Insert user
        sql = """
        INSERT INTO users (name, email, password_hash, phone, join_date, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            user.name,
            user.email,
            hashed_password,
            user.phone,
            current_time,
            current_time,
            current_time
        ))

        user_id = cursor.lastrowid

        # Insert default settings
        default_preferences = json.dumps({
            'email_notifications': True,
            'push_notifications': True,
            'bid_alerts': True,
            'price_updates': True,
            'newsletter': True
        })

        sql = """
        INSERT INTO user_settings (user_id, notification_preferences, theme_preference,
                                 language_preference, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            user_id,
            default_preferences,
            'system',
            'en',
            current_time,
            current_time
        ))

        conn.commit()
        
        return {
            "success": True,
            "message": "Registration successful",
            "userId": user_id
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        conn.close()

@app.get("/uploads/{path:path}")
async def serve_upload(path: str):
    try:
        clean_path = path.replace('\\', '/').lstrip('/')
        
        # Check uploads directory for new listings
        if clean_path.startswith('vehicles/'):
            upload_path = UPLOADS_DIR / clean_path
            if upload_path.exists():
                return FileResponse(str(upload_path))
        
        # Check assets directory for predefined images
        if clean_path.startswith('assets/images/'):
            asset_path = ASSETS_DIR / clean_path.replace('assets/', '')
            if asset_path.exists():
                return FileResponse(str(asset_path))
        
        # Return placeholder for missing images
        return FileResponse(str(PUBLIC_DIR / "images" / "placeholder.jpg"))
            
    except Exception as e:
        print(f"Error serving file {path}: {str(e)}")
        return FileResponse(str(PUBLIC_DIR / "images" / "placeholder.jpg"))

@app.post("/api/login", response_model=dict)
async def login(user: UserLogin):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # Get user
        cursor.execute("""
            SELECT id, email, name, password_hash, status
            FROM users
            WHERE email = %s AND status = 'active'
        """, (user.email,))
        
        db_user = cursor.fetchone()
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not verify_password(user.password, db_user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Create access token
        access_token = create_access_token(
            data={"sub": str(db_user['id'])}
        )

        # Update last login
        cursor.execute("""
            UPDATE users
            SET last_login = NOW()
            WHERE id = %s
        """, (db_user['id'],))
        
        conn.commit()

        return {
            "success": True,
            "user": {
                "id": db_user['id'],
                "email": db_user['email'],
                "name": db_user['name']
            },
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        conn.close()
# Add these routes to main.py
@app.get("/api/vehicles/{vin}/history")
async def get_vehicle_history(vin: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Simple select
        cursor.execute("""
            SELECT * FROM vehicle_service_records 
            WHERE vin = %s 
            ORDER BY created_at DESC
        """, (vin,))
        
        records = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for record in records:
            record['created_at'] = record['created_at'].isoformat()
            record['updated_at'] = record['updated_at'].isoformat()
            
        return {
            "success": True,
            "vin": vin,
            "serviceRecords": records
        }

    except Exception as e:
        print(f"Error fetching history: {str(e)}")
        return {"success": False, "message": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()


@app.post("/api/service-center/register", status_code=status.HTTP_200_OK)
async def register_service_center(
    businessName: str = Form(...),
    businessAddress: str = Form(...),
    licenseNumber: str = Form(...),
    phoneNumber: str = Form(...),
    email: str = Form(...),
    wallet_address: str = Form(...),
    documents: Optional[List[UploadFile]] = File(default=None)
):
    conn = None
    try:
        # Add detailed logging
        print(f"Received registration request for business: {businessName}")
        print(f"Wallet address: {wallet_address}")

        # Validate ethereum address with detailed error message
        try:
            if not Web3.is_address(wallet_address):
                detail = "Invalid wallet address format: Address must be a valid Ethereum address"
                print(f"Validation error: {detail}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=detail
                )
            wallet_address = Web3.to_checksum_address(wallet_address)
        except ValueError as e:
            detail = f"Invalid wallet address: {str(e)}"
            print(f"Validation error: {detail}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail
            )

        # Validate other required fields
        if not businessName or not businessAddress or not licenseNumber:
            detail = "Missing required fields: businessName, businessAddress, and licenseNumber are required"
            print(f"Validation error: {detail}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail
            )

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if already registered with detailed message
        cursor.execute(
            "SELECT id, status FROM service_centers WHERE wallet_address = %s",
            (wallet_address,)
        )
        existing = cursor.fetchone()
        if existing:
            detail = f"Wallet address already registered with status: {existing[1]}"
            print(f"Registration error: {detail}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail
            )

        try:
            # Insert service center record
            sql = """
                INSERT INTO service_centers 
                (business_name, license_number, email, phone, address, 
                wallet_address, status, approval_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
            """
            cursor.execute(sql, (
                businessName,
                licenseNumber,
                email,
                phoneNumber,
                businessAddress,
                wallet_address,
                'approved'
            ))
            service_center_id = cursor.lastrowid
            print(f"Created service center record with ID: {service_center_id}")

            # Process documents if provided
            document_paths = []
            if documents:
                upload_dir = f"uploads/service_centers/{service_center_id}"
                os.makedirs(upload_dir, exist_ok=True)

                for doc in documents:
                    if doc and doc.filename:
                        file_path = f"{upload_dir}/{doc.filename}"
                        content = await doc.read()
                        with open(file_path, "wb") as f:
                            f.write(content)
                        document_paths.append(file_path)

                        cursor.execute(
                            """INSERT INTO service_center_documents 
                            (service_center_id, document_type, file_path)
                            VALUES (%s, %s, %s)""",
                            (service_center_id, doc.content_type, file_path)
                        )

            # Blockchain authorization
            try:
                admin_account = w3.eth.accounts[0]
                nonce = w3.eth.get_transaction_count(admin_account)
                
                transaction = contract.functions.authorizeCenter(
                    wallet_address
                ).build_transaction({
                    'from': admin_account,
                    'gas': 200000,
                    'gasPrice': w3.eth.gas_price,
                    'nonce': nonce,
                })

                private_key = os.getenv('PRIVATE_KEY')
                if not private_key:
                    raise ValueError("PRIVATE_KEY not found in environment variables")
                
                signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
                tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
                
                tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

                if tx_receipt.status != 1:
                    raise Exception("Blockchain transaction failed")
                
                print(f"Blockchain authorization successful. Transaction hash: {tx_hash.hex()}")

            except Exception as blockchain_error:
                print(f"Blockchain error: {str(blockchain_error)}")
                # Continue with registration even if blockchain authorization fails
                # but log the error for monitoring

            conn.commit()
            print("Database transaction committed successfully")
            
            return {
                "success": True,
                "message": "Service center registered and authorized successfully",
                "service_center_id": service_center_id,
                "document_count": len(document_paths) if documents else 0
            }

        except Exception as db_error:
            conn.rollback()
            print(f"Database error: {str(db_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(db_error)}"
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        if conn:
            conn.close()

@app.post("/api/service-center/authorize/{center_id}")
async def authorize_service_center(center_id: int):
    conn = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # Get service center details
        cursor.execute(
            "SELECT wallet_address FROM service_centers WHERE id = %s",
            (center_id,)
        )
        center = cursor.fetchone()
        if not center:
            raise HTTPException(
                status_code=404,
                detail="Service center not found"
            )

        # Get admin account from Ganache
        admin_account = w3.eth.accounts[0]  # First Ganache account
        
        try:
            # Build transaction
            transaction = contract.functions.authorizeCenter(
                center['wallet_address']
            ).buildTransaction({
                'from': admin_account,
                'gas': 200000,
                'gasPrice': w3.eth.gas_price,
                'nonce': w3.eth.get_transaction_count(admin_account),
            })

            # Sign and send transaction
            signed_txn = w3.eth.account.sign_transaction(
                transaction, 
                private_key='your_private_key'  # Ganache account private key
            )
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

            # Update database
            if tx_receipt.status == 1:  # Success
                cursor.execute(
                    """UPDATE service_centers 
                    SET status = 'approved', approval_date = NOW()
                    WHERE id = %s""",
                    (center_id,)
                )
                conn.commit()

                return {
                    "success": True,
                    "message": "Service center authorized successfully",
                    "transaction_hash": tx_hash.hex()
                }
            else:
                raise Exception("Transaction failed")

        except Exception as e:
            conn.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Authorization failed: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    finally:
        if conn:
            conn.close()
# In main.py

@app.get("/api/service-center/check-wallet/{wallet_address}")
async def check_wallet_status(wallet_address: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Check if wallet exists
        cursor.execute("""
            SELECT id, business_name, status, approval_date 
            FROM service_centers 
            WHERE wallet_address = %s
        """, (wallet_address,))
        
        existing = cursor.fetchone()
        
        if existing:
            return {
                "exists": True,
                "status": existing["status"],
                "businessName": existing["business_name"],
                "approvalDate": existing["approval_date"]
            }
        
        return {
            "exists": False
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error checking wallet status: {str(e)}"
        )
    finally:
        if 'conn' in locals():
            conn.close()
@app.get("/api/service-center/check/{wallet_address}")
async def check_authorization(wallet_address: str):
    try:
        print(f"Checking authorization for wallet: {wallet_address}")
        
        # Validate wallet address format
        try:
            wallet_address = Web3.to_checksum_address(wallet_address)
        except Exception as e:
            print(f"Invalid wallet address format: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid wallet address format: {str(e)}"
            )

        # Check if contract is initialized
        if not contract:
            print("Contract not initialized")
            raise HTTPException(
                status_code=500,
                detail="Smart contract not initialized"
            )

        try:
            # Check blockchain authorization
            is_authorized = contract.functions.isAuthorized(wallet_address).call()
            print(f"Blockchain authorization result: {is_authorized}")
        except Exception as contract_error:
            print(f"Contract error: {str(contract_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Smart contract error: {str(contract_error)}"
            )

        # Get database details if authorized
        details = None
        if is_authorized:
            try:
                conn = get_db_connection()
                cursor = conn.cursor(pymysql.cursors.DictCursor)
                
                cursor.execute(
                    """SELECT id, business_name, status, approval_date 
                    FROM service_centers WHERE wallet_address = %s""",
                    (wallet_address,)
                )
                details = cursor.fetchone()
                print(f"Database details: {details}")
                
            except Exception as db_error:
                print(f"Database error: {str(db_error)}")
                # Don't fail completely if DB check fails but blockchain says authorized
                details = None
            finally:
                if 'conn' in locals():
                    conn.close()
        
        return {
            "is_authorized": is_authorized,
            "details": details,
            "wallet_address": wallet_address
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in check_authorization: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )
    
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc)
        }
    )
@app.post("/api/vehicles/{vin}/service-records")
async def add_service_record(vin: str, record: ServiceRecordRequest):
    logger.info(f"Received service record request: VIN={vin}, Data={record}")
    
    conn = None
    try:
        # Input validation
        if not vin or len(vin.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="VIN cannot be empty"
            )

        if not record.wallet_address:
            raise HTTPException(
                status_code=400,
                detail="Wallet address is required"
            )

        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Verify service center exists and is authorized
        cursor.execute("""
            SELECT id, business_name, wallet_address
            FROM service_centers 
            WHERE wallet_address = %s AND status = 'approved'
        """, (record.wallet_address,))
        
        service_center = cursor.fetchone()
        if not service_center:
            raise HTTPException(
                status_code=400,
                detail="Service center not found or not authorized"
            )
            
        current_time = datetime.now()

        try:
            # Insert into database
            insert_query = """
                INSERT INTO vehicle_service_records 
                (vin, service_type, description, mileage, 
                 service_center_id, service_center_name, 
                 status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(insert_query, (
                vin,
                record.service_type,
                record.description,
                int(record.mileage),  # Convert mileage to integer
                service_center['id'],
                service_center['business_name'],
                'completed',
                current_time,
                current_time
            ))
            
            # Commit transaction
            conn.commit()
            logger.info(f"Service record added to database for VIN: {vin}")
            
            return {
                "success": True,
                "message": "Service record added successfully",
                "record_id": cursor.lastrowid
            }
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Error in database transaction: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {str(e)}"
            )
            
    except HTTPException as he:
        logger.error(f"HTTP Exception: {str(he)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add service record: {str(e)}"
        )
    finally:
        if conn:
            conn.close()
@app.get("/api/vehicles/details/{id}")
async def get_vehicle_details(id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Join with vehicle_images table
        query = """
            SELECT 
                vl.*,
                GROUP_CONCAT(DISTINCT vi.image_path) as image_paths,
                GROUP_CONCAT(DISTINCT vi.is_primary) as is_primary
            FROM vehicle_listings vl
            LEFT JOIN vehicle_images vi ON vl.id = vi.vehicle_id
            WHERE vl.id = %s
            GROUP BY vl.id
        """
        
        cursor.execute(query, (id,))
        vehicle = cursor.fetchone()
        
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
            
        # Process images
        if vehicle.get('image_paths'):
            paths = vehicle['image_paths'].split(',')
            is_primary = vehicle['is_primary'].split(',')
            vehicle['images'] = [
                {
                    "path": path.strip(),
                    "url": f"/uploads/{path.strip()}",
                    "is_primary": bool(int(primary))
                } for path, primary in zip(paths, is_primary)
                if path and path.strip()
            ]
        else:
            vehicle['images'] = []
        
        # Clean up response
        vehicle.pop('image_paths', None)
        vehicle.pop('is_primary', None)
        
        return {
            "success": True,
            "data": vehicle
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching vehicle details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        if 'conn' in locals():
            conn.close()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)}
    )

@app.get("/api/test-db")
async def test_db_connection():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        conn.close()
        return {"status": "success", "message": "Database connection successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
async def upload_to_ipfs(content: bytes) -> str:
    """Helper function to upload content to IPFS"""
    try:
        # You'll need to set up your IPFS connection
        # This is just a placeholder - implement actual IPFS upload
        # You can use ipfs-http-client library
        import ipfshttpclient
        client = ipfshttpclient.connect()
        res = client.add(content)
        return res['Hash']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"IPFS upload failed: {str(e)}")
@app.post("/api/vehicles")
async def create_vehicle_listing(
    title: str = Form(...),
    description: str = Form(...),
    price: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    year: str = Form(...),
    mileage: str = Form(...),
    fuel_type: str = Form(...),
    transmission: str = Form(...),
    color: str = Form(...),
    location: str = Form(...),
    saleType: str = Form(...),
    auctionDuration: Optional[str] = Form(None),
    startingBid: Optional[str] = Form(None),
    images: List[UploadFile] = File(...)
):
    try:
        # Convert form data
        vehicle_data = {
            "title": title,
            "description": description,
            "price": float(price) if price else 0.0,
            "make": make,
            "model": model,
            "year": int(year) if year else 0,
            "mileage": int(mileage) if mileage else 0,
            "fuel_type": fuel_type,
            "transmission": transmission,
            "color": color,
            "location": location,
            "sale_type": saleType,
            "auction_duration": int(auctionDuration) if auctionDuration else None,
            "starting_bid": float(startingBid) if startingBid else None,
            "created_at": datetime.now()
        }

        # Insert into database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert vehicle data
        columns = ', '.join(vehicle_data.keys())
        placeholders = ', '.join(['%s'] * len(vehicle_data))
        sql = f"INSERT INTO vehicle_listings ({columns}) VALUES ({placeholders})"
        
        cursor.execute(sql, list(vehicle_data.values()))
        vehicle_id = cursor.lastrowid

        # Create vehicle image directory
        vehicle_image_dir = UPLOADS_DIR / "vehicles" / str(vehicle_id) / "images"
        vehicle_image_dir.mkdir(parents=True, exist_ok=True)

        # Save images
        saved_images = []
        for idx, image in enumerate(images):
            try:
                # Create filename with original extension
                ext = os.path.splitext(image.filename)[1].lower() or '.jpg'
                filename = f"image_{idx}{ext}"
                
                # Save file
                file_path = vehicle_image_dir / filename
                content = await image.read()
                with open(file_path, "wb") as f:
                    f.write(content)
                
                # Create relative path for database
                rel_path = f"vehicles/{vehicle_id}/images/{filename}"
                
                # Save image record
                cursor.execute(
                    "INSERT INTO vehicle_images (vehicle_id, image_path) VALUES (%s, %s)",
                    (vehicle_id, rel_path)
                )
                
                saved_images.append({
                    "path": rel_path,
                    "url": f"/uploads/{rel_path}"
                })
                
            except Exception as e:
                print(f"Error saving image {idx}: {str(e)}")
                continue

        conn.commit()
        
        return {
            "success": True,
            "vehicle_id": vehicle_id,
            "images": saved_images
        }

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        print(f"Error creating listing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        if 'conn' in locals():
            conn.close()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
