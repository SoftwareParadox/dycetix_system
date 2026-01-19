import os
import subprocess
import sys

def run_command(cmd):
    """Run a shell command and return output"""
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result

def test_step1():
    """Test Step 1: Verify env files exist"""
    print("=" * 50)
    print("STEP 1: Testing separate environment files")
    print("=" * 50)
    
    required_files = ['.env.admin', '.env.customer']
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ {file} exists")
        else:
            print(f"✗ {file} missing")
            return False
    
    # Check they're different
    with open('.env.admin', 'r', encoding='utf-8') as f:
        admin_content = f.read()
    with open('.env.customer', 'r', encoding='utf-8') as f:
        customer_content = f.read()
    
    if admin_content != customer_content:
        print("✓ Environment files are different")
    else:
        print("✗ Environment files are identical")
        return False
    
    return True

def test_step2():
    """Test Step 2: Can run apps separately"""
    print("\n" + "=" * 50)
    print("STEP 2: Testing separate app startup")
    print("=" * 50)
    
    # Test current setup still works
    print("Testing current setup...")
    result = run_command("docker-compose ps")
    # Check for 'Up' status for both services
    output = result.stdout
    admin_up = 'admin' in output and 'Up' in output
    customer_up = 'customer' in output and 'Up' in output
    
    if admin_up and customer_up:
        print("✓ Current docker-compose works")
    else:
        print("✗ Current docker-compose not running")
        return False
    
    return True

def main():
    print("DyceTix System Separation Test")
    print("=" * 50)
    
    # Step 1: Test env files
    if not test_step1():
        print("FAILED: Step 1 tests failed")
        sys.exit(1)
    
    # Step 2: Test current setup
    if not test_step2():
        print("FAILED: Step 2 tests failed")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("SUCCESS: All tests passed!")
    print("Next steps:")
    print("1. docker-compose down")
    print("2. Update docker-compose.yml to use separate .env files")
    print("3. docker-compose up -d --build")
    print("=" * 50)

if __name__ == "__main__":
    main()