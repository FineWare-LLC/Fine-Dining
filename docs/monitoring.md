# Monitoring and Alerts

This project uses the `winston` logging library to capture application logs.
Logs can optionally be forwarded to AWS CloudWatch by setting the environment
variables `AWS_REGION`, `CLOUDWATCH_LOG_GROUP`, and `CLOUDWATCH_LOG_STREAM`.

Basic Prometheus metrics are exposed via the `/api/metrics` endpoint. These
include request counts and error counts for the GraphQL API.

To set up alerts, configure CloudWatch or Prometheus alert rules for high error
rates or slow responses based on the collected metrics.
