#!/bin/bash

# ./cdn.sh --bucketname my-test-bucket --s3-prefix app/v1.0

echo "S3 Upload Script for mini build"

# Run bundle command first
echo "Running bundle command..."
npm run bundle

# Default values
SOURCE_DIR="build/generated/"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --bucketname)
      BUCKET_NAME="$2"
      shift 2
      ;;
    --s3-prefix)
      S3_PREFIX="$2"
      shift 2
      ;;
    --source)
      SOURCE_DIR="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--bucketname NAME] [--s3-prefix PREFIX] [--source DIR]"
      exit 1
      ;;
  esac
done

echo "Using bucket: $BUCKET_NAME"
echo "Using prefix: $S3_PREFIX"
echo "Source directory: $SOURCE_DIR"

# Check if source directory exists
[ ! -d "$SOURCE_DIR" ] && { echo "Error: Source directory $SOURCE_DIR does not exist"; exit 1; }

# Use conda Python with boto3
command -v conda &> /dev/null || { echo "Error: conda command not found"; exit 1; }

echo "Using conda to upload files to S3..."

# Create temporary Python script
TEMP_SCRIPT=$(mktemp)
cat > $TEMP_SCRIPT << 'EOF'
import boto3
import os
import sys
import botocore.exceptions

def check_credentials():
    try:
        boto3.client('sts').get_caller_identity()
        return True
    except botocore.exceptions.NoCredentialsError:
        print("\nError: AWS credentials not found")
        print("Please configure AWS credentials by running 'aws configure'")
        print("Or set environment variables:")
        print("    export AWS_ACCESS_KEY_ID=your_access_key")
        print("    export AWS_SECRET_ACCESS_KEY=your_secret_key")
        print("    export AWS_DEFAULT_REGION=your_region")
        return False
    except Exception as e:
        print(f"Error checking AWS credentials: {str(e)}")
        return False

def upload_directory(directory_path, bucket_name, s3_prefix=""):
    if not check_credentials():
        return
    
    try:
        s3_client = boto3.client('s3')
        file_count = 0
        
        for root, _, files in os.walk(directory_path):
            for file in files:
                local_path = os.path.join(root, file)
                relative_path = os.path.relpath(local_path, directory_path)
                s3_path = os.path.join(s3_prefix, relative_path).replace("\\", "/")
                
                # Set content type based on extension
                if file.lower().endswith('.js'):
                    content_type = 'application/javascript'
                elif file.lower().endswith('.json'):
                    content_type = 'application/json; charset=utf-8'
                else:
                    content_type = 'application/octet-stream'
                    
                print(f"Uploading {relative_path} as {content_type}")
                s3_client.upload_file(
                    local_path, bucket_name, s3_path, 
                    ExtraArgs={'ContentType': content_type}
                )
                file_count += 1
                
        print(f"Upload complete: {file_count} files uploaded")
    except Exception as e:
        print(f"Error uploading to S3: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    upload_directory(
        directory_path=sys.argv[1],
        bucket_name=sys.argv[2],
        s3_prefix=sys.argv[3]
    )
EOF

# Run script and cleanup
conda run -n base python $TEMP_SCRIPT "$SOURCE_DIR" "$BUCKET_NAME" "$S3_PREFIX"
rm $TEMP_SCRIPT
