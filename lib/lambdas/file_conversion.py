import json
import boto3

s3 = boto3.client('s3')

def lambda_handler(event, context):
    try:
        # Extract bucket and file information from the event
        bucket_name = event['Records'][0]['s3']['bucket']['name']
        input_file_key = event['Records'][0]['s3']['object']['key']

        # Ensure the event is triggered from the 'inputFiles/' folder
        if not input_file_key.startswith('inputFiles/'):
            raise ValueError('File is not in the inputFiles/ directory.')

        # Download the file from S3
        input_file_obj = s3.get_object(Bucket=bucket_name, Key=input_file_key)
        input_file_content = input_file_obj['Body'].read().decode('utf-8')

        # Mock "conversion" logic (for demonstration, append some text)
        converted_content = f"Converted Content:\n\n{input_file_content}"

        # Define the output file path in the 'outputFiles/' folder
        output_file_key = input_file_key.replace('inputFiles/', 'convertedFiles/').replace('.txt', '-converted.txt')

        # Upload the converted file to the 'outputFiles/' folder
        s3.put_object(Bucket=bucket_name, Key=output_file_key, Body=converted_content)

        # Success response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'File converted successfully!',
                'inputFile': input_file_key,
                'outputFile': output_file_key
            })
        }
    except Exception as e:
        print(f"Error processing file {input_file_key}: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
