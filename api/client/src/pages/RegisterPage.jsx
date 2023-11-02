import {Link, Navigate} from 'react-router-dom';
import {useState} from 'react';
import axios from 'axios';

export default function RegisterPage () {
  const [name, setName] = useState ('');
  const [email, setEmail] = useState ('');
  const [photoFile, setPhotoFile] = useState (null);
  const [password, setPassword] = useState ('');
  const [redirect, setRedirect] = useState ('');
  async function registerUser (ev) {
    ev.preventDefault ();

    try {
      const formData = new FormData ();
      formData.append ('name', name);
      formData.append ('email', email);
      formData.append ('password', password);
      if (photoFile) {
        formData.append ('photo', photoFile);
      }

      await axios.post ('/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert ('Registration successful. Now you can log in');
      setName ('');
      setEmail ('');
      setPassword ('');
      setRedirect ('/login');
    } catch (e) {
      alert ('Registration failed. Please try again later');
    }
  }
  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Register</h1>
        <form className="max-w-md mx-auto" onSubmit={registerUser}>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={ev => setName (ev.target.value)}
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={ev => setEmail (ev.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={ev => setPassword (ev.target.value)}
          />
          <div className="flex items-center mt-1 mb-1 p-1">
            <input
              type="file"
              accept="image/*"
              onChange={ev => setPhotoFile (ev.target.files[0])}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="bg-gray-200 hover:bg-primary text-black font-semibold py-2 px-4 rounded cursor-pointer"
            >
              Upload a Photo
            </label>
            {photoFile && <p className="ml-2">{photoFile.name}</p>}
          </div>

          <button className="primary">Register</button>
          <div className="text-center py-2 text-gray-500">
            Already a member?
            {' '}
            <Link className="underline text-black" to={'/login'}>Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
