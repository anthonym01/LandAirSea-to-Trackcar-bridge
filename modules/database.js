// json database
const logs = require('./logger');
const fs = require('fs');
const path = require('path');

let root_db_directory = path.join(process.cwd(), '/database/');//root path
let user_records_path = path.join(root_db_directory, 'users.json');//users record
let db_data_path = path.join(root_db_directory, 'userdata/');//data directory

const database = {
    initalize: function (path_for_database_folder) {

        try { //Allow the use of alternate paths/multiple databases at the same time
            if (typeof (path_for_database_folder) == undefined || typeof (path_for_database_folder) == 'undefined' || typeof (path_for_database_folder) == null) {
                logs.info('Initalize database with default path: ', root_db_directory );
            } else {
                root_db_directory = path.join(__dirname, String(path_for_database_folder));//root path
                logs.info('Initalize database on: ', root_db_directory);
            }
            user_records_path = path.join(root_db_directory, 'users.json');//users record
            db_data_path = path.join(root_db_directory, 'userdata/');//data directory

        } catch (error) {
            logs.error("Database Error: ", error);
        }

        try {
            //check if database exists
            if (!fs.existsSync(root_db_directory)) {
                logs.error("Database does not exist");
                fs.mkdirSync(root_db_directory, { recursive: true });
            } else {
                logs.info('Prior database exists')
            }

            //check if user data directory exists
            if (!fs.existsSync(db_data_path)) {
                logs.info('Creating user data directory', db_data_path);
                fs.mkdirSync(db_data_path);
            }

            //check if users record exists
            if (!fs.existsSync(user_records_path)) {
                logs.info('Creating test users record :', user_records_path);
                //create users record
                fs.writeFileSync(user_records_path, JSON.stringify({ db_version: 0, users: [] }), { encoding: 'utf-8' });
                //create test users
                database.create_user({ uname: "test", password: "0000" });
                database.create_user({ uname: "Anthonym", password: "0000" });
            }

            logs.info("Database check succeded");
        } catch (error) {
            // shouldnt get any errors here unless something is realy wrong
            console.log('Startup error, check if node runtime has write permission in ', root_db_directory);
            logs.error("Database Error: ", error);
        }
    },
    cleanup: async function () {
        /*
            Remove/bad/old/un-needed records
        */
        logs.info('Clean up database placeholder')
    },
    create_user: async function (new_user_details) {

        // Expects format:
        /* 
            new_user_details = {
                uuid:00000000000000000000000000000000,//will be generated if not provided
                uname:"",//mandatory
                password:"",//mandatory
                data:{}//initial data for user
            }
        */
        logs.info('Add new user entry to database :', new_user_details);

        try {
            //check if this user already exists
            let user_record_file_data = JSON.parse(fs.readFileSync(user_records_path, { encoding: 'utf-8' }));

            if (fs.existsSync(path.join(db_data_path, String(new_user_details.uuid) + '.json'))) {
                logs.info('User data already exists at: ', new_user_details.uuid);
                return false;//user will not be overwritten
            }

            //!! Improve matching later
            for (let iterate in user_record_file_data.users) {
                if (user_record_file_data.users[iterate].uname == new_user_details["uname"]) {
                    logs.info('User already exists at: ', user_record_file_data.users[iterate].uuid);
                    return false;//user will not be overwritten
                }
            }

            //update users records list with new user
            let new_uuid = new_user_details.uuid || Date.now();
            user_record_file_data.users.push({
                uuid: new_uuid,
                uname: new_user_details.uname,
                password: new_user_details.password,
            });

            user_record_file_data.db_version = Number(user_record_file_data.db_version) + 1;

            fs.writeFileSync(user_records_path, JSON.stringify(user_record_file_data), { encoding: 'utf-8' });

            //create this specific users file
            fs.writeFileSync(path.join(db_data_path, String(new_uuid) + '.json'), JSON.stringify({
                version: 0,
                lastupdate: new Date().getTime(),
                data: new_user_details.data || { test: "no data passed to user" },
            }));
            return true;//user should now be in database

        } catch (error) {
            console.log('error ', error)
            return false;//handle later
        }
    },
    delete_user: async function (username) {
        try {
            const database_paths = database.get_paths();
            logs.info('Delete user: ', username, ' at ', database_paths.users_data_records);

            let user_data = JSON.parse(fs.readFileSync(path.join(database_paths.users_data_records, username, '.json'), { encoding: 'utf-8' }));//get users record
            fs.unlinkSync(path.join(database_paths.users_data_records, username, '.json'));//delete user data record
            logs.info('User data deleted: ', user_data);

            let userlist = JSON.parse(fs.readFileSync(database_paths.users_file, { encoding: 'utf-8' }));//get users record
            for (let iterate in userlist.users) {//check if user exists
                if (userlist.users[iterate].uname == username) {
                    userlist.users.splice(iterate, 1);//remove user from users record
                    userlist.db_version = Number(userlist.db_version) + 1;
                    fs.writeFileSync(database_paths.users_file, JSON.stringify(userlist), { encoding: 'utf-8' });//update users record
                    logs.info('User removed from users record: ', userlist);
                    return true;
                }
            }
            logs.error('Could not find user in users record');
            return false;
        } catch (error) {
            logs.error('Error in delete_user: ', error);
            return false
        }
    },
    find: function (userlist, username_or_uuid) {
        for (let iterate in userlist.users) {//check if user exists
            if (userlist.users[iterate].uname == username_or_uuid || userlist.users[iterate].uuid == Number(username_or_uuid)) {
                logs.info(username_or_uuid, 'coresponds to: ', { uuid: userlist.users[iterate].uuid, uname: userlist.users[iterate].uname }, 'at index: ', iterate);
                return iterate;
            }
        }
        return false;
    },
    get_user: {
        credentials: async function (identifier) {

        },
        data: async function (username_or_uuid) {
            logs.info('Get user data for: ', username_or_uuid);

            try {
                const userlist = JSON.parse(fs.readFileSync(user_records_path, { encoding: 'utf-8' }));//get users record

                const working_index = await database.find(userlist, username_or_uuid);

                if (working_index === false) {
                    logs.error('User could not be found', username_or_uuid);
                    return { info: 'User could not be found', username_or_uuid }
                }

                const user_data = JSON.parse(fs.readFileSync(path.join(db_data_path, String(userlist.users[working_index].uuid) + '.json'), { encoding: 'utf-8' }));//get users record
                logs.info(`\n${username_or_uuid}'s data: `, user_data);
                return user_data;

            } catch (error) {
                logs.error('Error in get_user_data: ', error);
                return false
            }
        }
    },
    update_user: {
        credentials: async function (identifier, credentials) {

        },
        data: async function (identifier, data) {

        }
    },
    update_user_data_by_uuid: async function (uuid, new_data) {
        try {
            logs.info('Update at: ', uuid, ' with: ', new_data);

            let user_data = JSON.parse(fs.readFileSync(path.join(db_data_path, String(uuid) + '.json'), { encoding: 'utf-8' }));//get users record
            user_data.data = new_data;
            user_data.version = Number(user_data.version) + 1;
            user_data.lastupdate = new Date().getTime();
            fs.writeFileSync(path.join(database_paths.users_data_records, username, '.json'), JSON.stringify(user_data), { encoding: 'utf-8' });
            logs.info('User data updated: ', user_data);
            return true;
        } catch (error) {
            logs.error('Error in update_user_data: ', error);
            return false
        }
    },
    change_password: async function (username, new_password) {
        try {
            const database_paths = database.get_paths();
            logs.info('Change password for: ', username, ' at ', database_paths.users_file);

            let userlist = JSON.parse(fs.readFileSync(database_paths.users_file, { encoding: 'utf-8' }));//get users record
            for (let iterate in userlist.users) {//check if user exists
                if (userlist.users[iterate].uname == username) {
                    userlist.users[iterate].password = new_password;
                    userlist.db_version = Number(userlist.db_version) + 1;
                    fs.writeFileSync(database_paths.users_file, JSON.stringify(userlist), { encoding: 'utf-8' });//update users record
                    logs.info('Password changed for user: ', username);
                    return true;
                }
            }
            logs.error('Could not find user in users record');
            return false;
        } catch (error) {
            logs.error('Error in change_password: ', error);
            return false
        }
    }
};

module.exports = database;