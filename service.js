/**
* dmax address book service
*
* @monthrie
*/

// Initialize MDS
MDS.init(function(msg) {
    // Check if the received message is a MAXIMA message
    if (msg.event == "MAXIMA") {
        //if it is then log it
        MDS.log('Received MAXIMA message: ' + JSON.stringify(msg));
        // Check if the application is the one we're interested in
        if (msg.data.application == "dmaxab") {
            // Log the received data
            MDS.log('Received data: ' + msg.data.data);
            // Convert the data from hex to string
            MDS.cmd(`convert from:HEX to:String data:${msg.data.data}`, function(resp) {
                // Parse the string as JSON
                const jsonData = JSON.parse(resp.response.conversion);
                // Log the parsed JSON
                MDS.log('Parsed JSON: ' + JSON.stringify(jsonData));

                // Check the type of the message
                switch (jsonData.type) {
                    case "ADD_ADDRESS":
                        // Extract the 'name' and 'max' from the JSON data
                        const name = jsonData.data.name;
                        const max = jsonData.data.max;

                        // Add the new entry to the AddressBook table
                        MDS.sql(`INSERT INTO AddressBook (name, max) VALUES ('${name}', '${max}')`, function(response) {
                            if (response.status) {
                                MDS.log('New entry added to AddressBook');
                            } else {
                                MDS.log('There was an error adding the new entry: ' + response.error);
                            }
                        });
                        break;
                    case "TABLE_REQUEST":
                        // Log the request
                        MDS.log('Received table request');
                        // Retrieve all entries from the AddressBook table
                        MDS.sql("SELECT * FROM AddressBook", function(response) {
                            //log the response
                            MDS.log('Response: ' + JSON.stringify(response));
                            if (response.status) {
                                // Log the table data
                                MDS.log('Table data: ' + JSON.stringify(response.rows));
                                // Convert the table data to JSON format
                                const tableData = response.rows.map(row => {
                                    return {
                                        name: row.NAME,
                                        max: row.MAX
                                    };
                                });
                                // Log the table data
                                MDS.log('Table data: ' + JSON.stringify(tableData));

                                // Send the table data back to the client-side
                                send({
                                    type: "TABLE_DATA",
                                    data: tableData
                                }, "MAX#0x30819F300D06092A864886F70D010101050003818D00308189028181009BB7465C454425291EBC2A851A4852F8C1B02F7A173A15780B304E2DCA663CC69AF15CA39D21914F5C1C4D20BE1066A29446F1B6AC8BC7FE1AE466D7E672C9BFAB64BA35BEE30ED8217BDB95959EA1B4410C70EF348051642876A8E99138AFCF5933E6DB3DB3ADBB3D418DBFFF30675D8BBB1A534DC5EE03740801579A73A0D10203010001#MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G1C0ANS2ENGJEFBYJM2SCQFR3U3KBJNP1WS9B0KG1Z2QG5T68S6N2C15B2FD7WHV5VYCKBDW943QZJ9MCZ03ESQ0TDR86PEGUFRSGEJBANN91TY2RVPQTVQSUP26TNR399UE9PPJNS75HJFTM4DG2NZRUDWP06VQHHVQSGT9ZFV0SCZBZDY0A9BK96R7M4Q483GN2T04P30GM5C10608005FHRRH4@78.141.238.36:9001");
                            } else {
                                MDS.log('There was an error retrieving the table data: ' + response.error);
                            }
                        });
                        break;
                    default:
                        MDS.log('Received unsupported message type: ' + jsonData.type);
                }
            });
        }
    }
});

function send(data, address) {
    // Stringify the data
    const dataStr = JSON.stringify(data);

    // Construct the Maxima command string
    const maxCmd = `maxima action:send to:${address} application:dmaxabclient data:${dataStr}`;

    // Send the Maxima command
    MDS.cmd(maxCmd, function(response) {
        if (response.status) {
            MDS.log('Message sent successfully');
            // Log the message contents
            MDS.log('Message contents: ' + dataStr);
        } else {
            MDS.log('There was an error sending the message: ' + response.error);
        }
    });
}


// the command that gets us there:
// maxima action:send to:MAX#0x30819F300D06092A864886F70D010101050003818D00308189028181009BB7465C454425291EBC2A851A4852F8C1B02F7A173A15780B304E2DCA663CC69AF15CA39D21914F5C1C4D20BE1066A29446F1B6AC8BC7FE1AE466D7E672C9BFAB64BA35BEE30ED8217BDB95959EA1B4410C70EF348051642876A8E99138AFCF5933E6DB3DB3ADBB3D418DBFFF30675D8BBB1A534DC5EE03740801579A73A0D10203010001#MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G1C0ANS2ENGJEFBYJM2SCQFR3U3KBJNP1WS9B0KG1Z2QG5T68S6N2C15B2FD7WHV5VYCKBDW943QZJ9MCZ03ESQ0TDR86PEGUFRSGEJBANN91TY2RVPQTVQSUP26TNR399UE9PPJNS75HJFTM4DG2NZRUDWP06VQHHVQSGT9ZFV0SCZBZDY0A9BK96R7M4Q483GN2T04P30GM5C10608005FHRRH4@78.141.238.36:9001 application:dmaxab data:{"type":"ADD_ADDRESS","data":{"name":"barry","max":"666"}}

