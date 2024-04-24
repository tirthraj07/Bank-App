"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'


export default function LoginComponent({ signUpPage }:{
    signUpPage: () => void;
}) {
    const router = useRouter()
    useEffect(()=>{
        require('bootstrap/dist/css/bootstrap.min.css')
        require('bootstrap/dist/js/bootstrap.bundle.min.js')
    },[])

    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleError = (err: Error) => {
        const errors: string[] = [];
        
        let errMessage = err.message.split(' ').map((str)=> str.charAt(0).toUpperCase() + str.slice(1)).join(' ');

        errors.push(`Error : ${errMessage}`);
        setValidationErrors(errors);
        //console.log(err.message);
    }

    async function loginRequest(formData: { email: string; password: string; }) {
        try{
        
            const response = await fetch(`/api/login`,{
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            

            const data = await response.json()

            if(data['error']) throw new Error(data['error'])
            
            // cookies.set('userToken',data['userToken'])
            
            //console.log(data);
            
            router.push('/');
        }
        catch(err){
            handleError(err as Error);
        }   
    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors: string[] = validateForm(formData);
        if (errors.length === 0) {
            await loginRequest(formData);
            
        } else {
            setValidationErrors(errors);
        }
    };

    
    const validateForm = (data: {email: string; password: string; }) => {
        const errors: string[] = [];

        // Password validation
        if (data.password.length < 8 || !(/[a-zA-Z]/.test(data.password)) || !(/\d/.test(data.password)) || !(/[^\w\s]/.test(data.password))) {
            errors.push('Password must be longer than 8 characters and contain alphabets, numbers, and symbols.');
        }

        // Email validation
        const emailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com'];
        const emailProvider = data.email.split('@')[1];
        if (!emailProviders.includes(emailProvider)) {
            errors.push('Email must be from a valid provider (Google, Yahoo, Hotmail).');
        }

        return errors;
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
                    {validationErrors.length > 0 && (
                        <div className="alert alert-danger mt-3" role="alert">
                            {validationErrors.map((error, index) => (
                                <p key={index}>{error}</p>
                            ))}
                        </div>
                    )}
                    <p className="mt-3">Don't have an account? <button className="btn btn-link" onClick={signUpPage}>Sign Up</button></p>
                </div>
            </div>
        </div>
    );
}
