import { Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Bucket, BucketEncryption, EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import * as path from 'path';
import { INPUT_PREFIX } from '../utils/constants';

export class FileConverterCdkStack extends Stack {

  private readonly aws_account: string;
  private readonly aws_region: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.aws_account = props?.env?.account ?? 'default-account';
    this.aws_region = props?.env?.region ?? 'us-east-1';

    // S3 Bucket for storing files
    const fileBucket = new Bucket(this, `${this.aws_region}-fileconverterbucket-${this.aws_account}`, {
      removalPolicy: RemovalPolicy.RETAIN,
      encryption: BucketEncryption.S3_MANAGED,
      bucketName: `${this.aws_region}-fileconverterbucket-${this.aws_account}`, 
      lifecycleRules: [{
        expiration: Duration.days(10),
      }],
    });

    // Create the Lambda function (Python)
    const fileConversionLambda = new Function(this, 'FileConversionLambda', {
      runtime: Runtime.PYTHON_3_9,
      functionName: 'FileConverterLambda',
      handler: 'file_conversion.lambda_handler',
      code: Code.fromAsset(path.join(__dirname, '..', 'lambdas')),
      environment: {
        BUCKET_NAME: fileBucket.bucketName,
      },
      memorySize: 128,
      timeout: Duration.minutes(5)
    });

    // Grant Lambda read/write access to the S3 bucket
    fileBucket.grantReadWrite(fileConversionLambda);

    // Set up S3 event notifications to trigger Lambda when a file is uploaded to 'inputFiles/'
    fileBucket.addEventNotification(
      EventType.OBJECT_CREATED_PUT,
      new LambdaDestination(fileConversionLambda),
      { prefix: INPUT_PREFIX }  // Listen for files in the 'inputFiles/' folder
    );

  }
}
