# test_connection.py
from web3 import Web3
import json
from eth_account import Account
import os
from dotenv import load_dotenv

def test_authorization():
    load_dotenv()
    
    w3 = Web3(Web3.HTTPProvider(os.getenv('GANACHE_URL')))
    
    # Load contract
    contract_address = os.getenv('VEHICLE_HISTORY_CONTRACT_ADDRESS')
    with open('ServiceCenterAuth.json') as f:
        contract_json = json.load(f)
    
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(contract_address),
        abi=contract_json
    )
    
    # Get account
    account = Account.from_key(os.getenv('PRIVATE_KEY'))
    
    # Check if authorized
    is_authorized = contract.functions.isAuthorized(account.address).call()
    print(f"Account {account.address}")
    print(f"Authorization status: {is_authorized}")
    
    if not is_authorized:
        # Authorize the account using owner account
        try:
            owner = contract.functions.owner().call()
            if owner == account.address:
                # Build transaction
                nonce = w3.eth.get_transaction_count(account.address)
                tx = contract.functions.authorizeCenter(account.address).build_transaction({
                    'from': account.address,
                    'gas': 200000,
                    'gasPrice': w3.eth.gas_price,
                    'nonce': nonce,
                })
                
                # Sign and send transaction
                signed_tx = w3.eth.account.sign_transaction(tx, os.getenv('PRIVATE_KEY'))
                tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
                
                # Wait for confirmation
                receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
                if receipt.status == 1:
                    print(f"✅ Account successfully authorized")
                    return True
            else:
                print("❌ Only owner can authorize service centers")
                return False
                
        except Exception as e:
            print(f"❌ Authorization failed: {str(e)}")
            return False
    else:
        print("✅ Account already authorized")
        return True

if __name__ == "__main__":
    test_authorization()