import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class CdkFirstStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Import OpenAPI specification from file
    const openApiSpec = apigateway.AssetApiDefinition.fromAsset('./services/api.yaml');

    // Create a SpecRestApi using the OpenAPI specification
    const api = new apigateway.SpecRestApi(this, 'cars-cdk-api', {
      apiDefinition: openApiSpec
    });

    // Define a list with lambda names
    const lambdaNames = [
      { name: 'cars-get', handler: 'index.lambda_handler' },
      { name: 'cars-post', handler: 'index.lambda_handler' }
    ];

    // Iterate over the list and create a Lambda function for each name
    lambdaNames.forEach((lambdaConfig) => {
      const lambdaFn = new lambda.Function(this, lambdaConfig.name, {
        runtime: lambda.Runtime.PYTHON_3_9,
        functionName: lambdaConfig.name,
        handler: lambdaConfig.handler,
        code: lambda.Code.fromAsset(path.join(__dirname, `../services/lambdas/${lambdaConfig.name}`))
      });

      // Grant API Gateway permissions to invoke the Lambda function
      lambdaFn.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
    });
  }
}

const app = new cdk.App();
new CdkFirstStack(app, 'ApiGatewayLambdaExample');
