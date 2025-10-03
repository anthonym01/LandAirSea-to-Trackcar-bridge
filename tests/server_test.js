
async function writeresponce(res, filepath) {
    //write files in responses

    try {
        res.setHeader('Acess-Control-Allow-Origin', '*');//allow access control from client, this will automatically handle most media files

        fs.readFile(filepath, function (err, databuffer) {
            if (err) {
                res.writeHead(404);//not okay
                logs.error(err);
            } else {
                res.writeHead(200);//200 ok
                res.write(databuffer);
            }
            res.end();//end response
        })
    } catch (error) {
        logs.error(error);
    }
}
