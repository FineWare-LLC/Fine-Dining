import winston from 'winston';
// import WinstonCloudWatch from 'winston-cloudwatch';

const {
    LOG_LEVEL = 'info',
    AWS_REGION,
    CLOUDWATCH_LOG_GROUP,
    CLOUDWATCH_LOG_STREAM,
} = process.env;

const transports = [
    new winston.transports.Console({ level: LOG_LEVEL }),
];

/*
if (AWS_REGION && CLOUDWATCH_LOG_GROUP && CLOUDWATCH_LOG_STREAM) {
    transports.push(
        new WinstonCloudWatch({
            level: LOG_LEVEL,
            awsRegion: AWS_REGION,
            logGroupName: CLOUDWATCH_LOG_GROUP,
            logStreamName: CLOUDWATCH_LOG_STREAM,
        }),
    );
}
*/

const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: winston.format.json(),
    transports,
});

export default logger;
