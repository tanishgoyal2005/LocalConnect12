var cloudinary=require("cloudinary").v2;
require('dotenv').config();//reading .env file
function getCloudinaryObject()
{
cloudinary.config({ 
            cloud_name:process.env.CLOUD_NAME, 
            api_key:process.env.CLOUD_API , 
            api_secret: process.env.CLOUD_KEY // Click 'View API Keys' above to copy your API secret
        });
        return cloudinary;
}

module.exports={getCloudinaryObject};

