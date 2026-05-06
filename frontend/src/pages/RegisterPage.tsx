import RegisterForm from '../components/Auth/RegisterForm';
import SEO from '../components/SEO';

const RegisterPage = () => {
  return (
    <>
      <SEO 
        title="Create Your Account"
        description="Join thousands of students in Cameroon and start your GCE preparation journey with expert video solutions."
      />
      <RegisterForm />
    </>
  );
};

export default RegisterPage;
