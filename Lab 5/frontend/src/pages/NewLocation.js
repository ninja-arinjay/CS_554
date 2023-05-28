import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPLOAD_LOCATION } from "../queries";

const NewLocation = () => {
  const [uploadLocation] = useMutation(UPLOAD_LOCATION);
  const [image, setImage] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [invalid, setInvalid] = useState(false);

  function validateData(image, name, address) {
    if(!name){
        return false;
    }
    if(!address){
        return false;
    }
    if(!image){
        return false;
    }
    return true;
  }

  let handleSubmit = (e) =>{
    e.preventDefault();
    if(validateData(image,name,address)){
        setUploadSuccess(true);
        setInvalid(false);
        uploadLocation({
            variables:{
                image,
                name,
                address
            }
        })
        setName("");
        setAddress("");
        setImage("");
    }else{
        setInvalid(true);
        setUploadSuccess(false);
    }

  };
  return (
    <div>
      <h1>Create a Location</h1>
      <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <br />
      <label>
        Address:
        <input type="text" value={address} onChange={(event) => setAddress(event.target.value)} />
      </label>
      <br />
      <label>
        Image:
        <input type="text" value={image} onChange={(event) => setImage(event.target.value)} />
      </label>
      <br />
      <button type="submit">Submit</button>
      </form>
      {uploadSuccess && <p>Upload Successful!</p>}
      {invalid && (
        <p>One or more fields are invalid. Ensure Image URL exists.</p>
      )}
    </div>
  );
};

export default NewLocation;