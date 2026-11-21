let jwt = require("jsonwebtoken");

function validateToken(req, resp, next) {
    let fulltoken = req.headers["authorization"];

    // Safety check: Agar header missing ya galat format mein hai
    if (!fulltoken || !fulltoken.startsWith("Bearer ")) {
        return resp.json({ status: false, msg: "Authorization token missing or invalid format" });
    }

    let ary = fulltoken.split(" ");

    try {
        let TokenValidObj = jwt.verify(ary[1], process.env.SEC_KEY);
        console.log("********" + TokenValidObj);
        
        if (TokenValidObj != null) {
            const payload = jwt.decode(ary[1]);
            console.log("*****" + JSON.stringify(payload) + "******");

            next(); // send to controller
        } else {
            return resp.json({ status: false, msg: "**Invalid Token" });
        }
    } catch (err) {
        return resp.json({ status: false, msg: err.message });
    }
}

module.exports = { validateToken };