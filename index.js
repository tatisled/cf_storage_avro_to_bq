/**
 *
 */
const https = require('https');

exports.invokeAvroToBqJob = (file, context) => {
    let fileName = file.name;

    if (!fileName.match('\.avro')) {
        return;
    }

    console.log(`  Event: ${context.eventId}`);
    console.log(`  Event Type: ${context.eventType}`);
    console.log(`  Bucket: ${file.bucket}`);
    console.log(`  File: ${file.name}`);
    console.log(`  Metageneration: ${file.metageneration}`);
    console.log(`  Created: ${file.timeCreated}`);
    console.log(`  Updated: ${file.updated}`);

    console.log(`  Run job to load avro to BQ from template`);

    //https.get('https://us-central1-onboardingproject-319313.cloudfunctions.net/avroToBqFunc', (resp) => {
    //    let data = '';
//
    //    // A chunk of data has been received.
    //    resp.on('data', (chunk) => {
    //        data += chunk;
    //    });
//
    //    // The whole response has been received. Print out the result.
    //    resp.on('end', () => {
    //        console.log(data);
    //    });
//
    //}).on("error", (err) => {
    //    console.log("Error: " + err.message);
    //});

    const data = JSON.stringify({
        template: "gs://onboardingproject_bucket_1/custom_templates/new_template_from_maven.json",
        jobName: "avro_to_bq_calcite",
        parameters: {
            "region": "us-central1",
            "inputPath": "gs://onboardingproject_bucket_1/avro_dataset.avro",
            "bqTable": "onboardingproject-319313:bq_dataset.bq_table_from_avro"
        }
    });

    const options = {
        host: 'us-central1-onboardingproject-319313.cloudfunctions.net',
        // port: 8080,
        path: '/invokeDataflowJob',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }

    console.log(`   Complete options: ${options}`)

    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', d => {
            console.log(`    Got response from cf_listen_to_http_invoke_job, response: `)
            console.log(Buffer.from(d, 'base64').toString());
        });
    });

    req.on('error', error => {
        console.log(`    Got error from cf_listen_to_http_invoke_job, error: `)
        console.error(error);
    });

    console.log(`   Calling psql_to_avro function by https...`);
    req.write(data);
    req.end();

};

