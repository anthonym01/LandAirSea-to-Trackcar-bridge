
window.addEventListener('load', async function () {//Starting point
    try {
        await config.load();//Load config from local storage
    } catch (err) {
        console.warn('Something bad happened: ', err);
    } finally {
        //Test get button
        document.getElementById('testpost_btn').addEventListener('click', function () {
            //Test post button
            console.log("testpost");
            post({ payload: document.getElementById('postablegarbage').value }, '/post/test');
        });

    }
});

async function request(what) {
    /* This block of code is a function named `request` that performs a GET request using the Fetch */
    try {
        const response = await fetch(what);
        if (!response.ok) { throw new Error('Network failiure'); }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function post(what, where) {
    /* This block of code is a function named `post` that performs a POST request using the Fetch API.*/
    try {
        const response = await fetch(where, {
            method: "POST",
            body: JSON.stringify(what),//JSON.stringify({ payload: "test" }),
            headers: { "Content-type": "application/json; charset=UTF-8" }
        });
        if (!response.ok) { throw new Error('Network failiure'); }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        return false;
    }
}

let config = {
    /* The `config` is used to manage local application data by saving,loading, and deleting configuration settings via local storage. */
    data: {//Loacal app data

    },
    save: async function () {//Save config via local storage
        console.table('Configuration is being saved', config.data);
        localStorage.setItem("express_cfg", JSON.stringify(config.data));
    },
    load: function () {//Load config from local storage
        console.log('Configuration is being loaded');
        config.data = JSON.parse(localStorage.getItem("express_cfg"));
        console.log('config Loaded: ', config.data);
    },
    delete: function () {//wipe the config
        localStorage.clear("express_cfg");//yeet the storage key
        console.log('config deleted: ');
        console.table(config.data);
        config.data = {};
    },
}
