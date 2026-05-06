import LoginForm from '../components/Auth/LoginForm';
import SEO from '../components/SEO';

const LoginPage = () => {
  return (
    <>
      <SEO 
        title="Login to Your Account"
        description="Access your student portal, resume your studies, and track your GCE preparation progress."
      />
      <LoginForm />
    </>
  );
};

export default LoginPage;
