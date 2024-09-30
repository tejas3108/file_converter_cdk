#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FileConverterCdkStack } from '../lib/stacks/file_converter_cdk-stack';

const app = new cdk.App();
new FileConverterCdkStack(app, 'FileConverterCdkStack', {
  env: { account: '183295420674', region: 'us-east-1' },
});