import { useState } from 'react';

export default function LoginComponent({ signUpPage }:{
    signUpPage: () => void;
}) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // You can handle login logic here, e.g., send data to server
        console.log(formData);

        setFormData({email:'',password:''})
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>
                    <p className="mt-3">Don't have an account? <button className="btn btn-link" onClick={signUpPage}>Sign Up</button></p>
                </div>
            </div>
        </div>
    );
}
