const fs = require('fs');
const path = require('path');

const loggerite = {
    // startup point
    initalize: function () {
        this.checkfs()
    },
    //Paths for logs are generated based on time
    get_paths: function () {
        try {
            const timex = new Date();
            const file_path = path.join(process.cwd(), `/logs/${timex.getMonth() + 1}-${timex.getFullYear()}/${timex.getMonth() + 1}-${timex.getDate()}.log`);//'./logs/mm-yyyy/mm-dd.log'
            return { file_path, timex }
        } catch (error) {
            console.error(error);
            return { file_path: path.join(__dirname, `/logs/default.log`), timex: 0 }
        }
    },
    // Check folders structure
    checkfs: function () {
        console.log('checking log path');
        const log_properties = this.get_paths();
        try {
            if (!fs.existsSync(log_properties.file_path)) {//if log file does not exist
                if (!fs.existsSync(path.dirname(log_properties.file_path))) {//if /logs folder does not exist
                    console.log('Create: ', path.dirname(log_properties.file_path));
                    fs.mkdirSync(path.dirname(log_properties.file_path), { recursive: true });//create log folder
                }
                console.log('Create: ', log_properties.file_path);
                fs.writeFileSync(log_properties.file_path, `Start log - ${log_properties.timex}\n\n`, { encoding: 'utf8' });//create log file
            }
        } catch (error) {
            console.error(error);
        }
        return -1;
    },
    //log happenings
    info: async function (...args) {
        const log_properties = this.get_paths();//get log paths
        
        /*
            Keep node consoles style for numbers objects and blobs
        */
        // Process arguments
        const argummentlength = arguments.length;
        if (argummentlength == 0) {
            console.log("no arguments passed to logger")
            return 0
        } else if (argummentlength == 1) {
            console.log(arguments[0]);
            let arguments1 = arguments[0];
            if (typeof arguments1 === 'object') arguments1 = `\n${JSON.stringify(arguments1, null, 2)}`;
            writelog(arguments1);
            return 1;
        } else if (argummentlength == 2) {
            console.log(arguments[0], arguments[1]);
            let arguments1 = arguments[0];
            let arguments2 = arguments[1];
            if (typeof arguments1 === 'object') arguments1 = `\n${JSON.stringify(arguments1, null, 2)}`;
            if (typeof arguments2 === 'object') arguments2 = `\n${JSON.stringify(arguments2, null, 2)}`;
            writelog(`${arguments1}${arguments2}`);
            return 2;
        } else if (argummentlength == 3) {
            console.log(arguments[0], arguments[1], arguments[2]);
            let arguments1 = arguments[0];
            let arguments2 = arguments[1];
            let arguments3 = arguments[2];
            if (typeof arguments1 === 'object') arguments1 = `\n${JSON.stringify(arguments1, null, 2)}`;
            if (typeof arguments2 === 'object') arguments2 = `\n${JSON.stringify(arguments2, null, 2)}`;
            if (typeof arguments3 === 'object') arguments3 = `\n${JSON.stringify(arguments3, null, 2)}`;
            writelog(`${arguments1}${arguments2}${arguments3}`);
            return 3;
        } else if (argummentlength == 4) {
            console.log(arguments[0], arguments[1], arguments[2], arguments[3]);
            let arguments1 = arguments[0];
            let arguments2 = arguments[1];
            let arguments3 = arguments[2];
            let arguments4 = arguments[3];
            if (typeof arguments1 === 'object') arguments1 = `\n${JSON.stringify(arguments1, null, 2)}`;
            if (typeof arguments2 === 'object') arguments2 = `\n${JSON.stringify(arguments2, null, 2)}`;
            if (typeof arguments3 === 'object') arguments3 = `\n${JSON.stringify(arguments3, null, 2)}`;
            if (typeof arguments4 === 'object') arguments4 = `\n${JSON.stringify(arguments4, null, 2)}`;
            writelog(`${arguments1}${arguments2}${arguments3}${arguments4}`);
            return 3;
        } else {
            let stripped_arguments = ``;
            try {// to process passed arguments
                for (let arg in arguments) {
                    //console.log(arg)
                    if (typeof arguments[arg] === 'object') {
                        stripped_arguments = stripped_arguments + ` \n${JSON.stringify(arguments[arg], null, 2)}`;
                        //process.stdout.write(arguments[arg]);
                    } else {
                        stripped_arguments = stripped_arguments + `${arguments[arg]} `;
                    }
                }
                console.log(stripped_arguments)
                //process.stdout.write('\n');
                writelog(stripped_arguments);
                return arguments.length;
            } catch (err) {
                console.error(err)
            }
        }

        //write to log file
        function writelog(datum) {
            try {
                fs.appendFileSync(log_properties.file_path, `${log_properties.timex} : \n${datum}\n------------------------------------------------------------\n`, { encoding: 'utf8' });
            } catch (error) {
                throw error;
            }
        }
    },
    //log bad happenings
    error: async function (...anyerror) {
        const log_properties = this.get_paths();
        /*
            Keep node consoles style for numbers objects and blobs
        */
        // Process arguments
        const argummentlength = arguments.length;
        if (argummentlength == 0) {
            console.log("no arguments passed to logger")
            return 0;
        } else if (argummentlength == 1) {
            console.error(arguments[0]);
            let arguments1 = arguments[0];
            if (typeof arguments1 === 'object') arguments1 = `\n${JSON.stringify(arguments1, null, 2)}`;
            writelog(arguments1);
            return 1;
        } else if (argummentlength == 2) {
            console.error(arguments[0], arguments[1]);
            let arguments1 = arguments[0];
            let arguments2 = arguments[1];
            if (typeof arguments1 === 'object') arguments1 = `\n${JSON.stringify(arguments1, null, 2)}`;
            if (typeof arguments2 === 'object') arguments2 = `\n${JSON.stringify(arguments2, null, 2)}`;
            writelog(`${arguments1}${arguments2}`);
            return 2;
        } else if (argummentlength == 3) {
            console.error(arguments[0], arguments[1], arguments[2]);
            let arguments1 = arguments[0];
            let arguments2 = arguments[1];
            let arguments3 = arguments[2];
            if (typeof arguments1 === 'object') arguments1 = `\n${JSON.stringify(arguments1, null, 2)}`;
            if (typeof arguments2 === 'object') arguments2 = `\n${JSON.stringify(arguments2, null, 2)}`;
            if (typeof arguments3 === 'object') arguments3 = `\n${JSON.stringify(arguments3, null, 2)}`;
            writelog(`${arguments1}${arguments2}${arguments3}`);
            return 3;
        } else if (argummentlength == 4) {
            console.error(arguments[0], arguments[1], arguments[2], arguments[3]);
            let arguments1 = arguments[0];
            let arguments2 = arguments[1];
            let arguments3 = arguments[2];
            let arguments4 = arguments[3];
            if (typeof arguments1 === 'object') arguments1 = `\n${JSON.stringify(arguments1, null, 2)}`;
            if (typeof arguments2 === 'object') arguments2 = `\n${JSON.stringify(arguments2, null, 2)}`;
            if (typeof arguments3 === 'object') arguments3 = `\n${JSON.stringify(arguments3, null, 2)}`;
            if (typeof arguments4 === 'object') arguments4 = `\n${JSON.stringify(arguments4, null, 2)}`;
            writelog(`${arguments1}${arguments2}${arguments3}${arguments4}`);
            return 3;
        } else {
            let stripped_arguments = ``;
            try {// to process passed arguments
                for (let arg in arguments) {
                    //console.log(arg)
                    if (typeof arguments[arg] === 'object') {
                        stripped_arguments = stripped_arguments + ` \n${JSON.stringify(arguments[arg], null, 2)}`;
                        //process.stdout.write(arguments[arg]);
                    } else {
                        stripped_arguments = stripped_arguments + `${arguments[arg]} `;
                    }
                }
                console.error(stripped_arguments);
                writelog(stripped_arguments);
                return arguments.length;
            } catch (err) {
                console.error(err)
            }
        }

        function writelog(datum) {//write to log file
            try {
                fs.appendFileSync(log_properties.file_path, `\n****************************************\nError:\n${log_properties.timex} :\n${datum}\n******************************************\n\n`, { encoding: 'utf8' });
            } catch (error) {
                console.error("Logger Error", error);
                loggerite.checkfs();
            }
        }
    },
}

module.exports = loggerite;