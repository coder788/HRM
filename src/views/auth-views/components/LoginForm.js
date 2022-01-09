import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button, Form, Input, Divider, Alert } from "antd";
import Icon, { AndroidOutlined } from "@ant-design/icons";
import { UserOutlined, LockOutlined, AppleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { GoogleSVG, FacebookSVG } from "assets/svg/icon";
import CustomIcon from "components/util-components/CustomIcon";
import {
  showLoading,
  hideLoading,
  showAuthMessage,
  hideAuthMessage,
  authenticated,
} from "redux/actions/Auth";
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion";
import JwtAuthService from "services/JwtAuthService";
import { AUTH_TOKEN, USER_INFO } from "redux/constants/Auth";

export const LoginForm = (props) => {
  let history = useHistory();

  const {
    otherSignIn,
    showForgetPassword,
    hideAuthMessage,
    onForgetPasswordClick,
    showLoading,
    hideLoading,
    extra,
    loading,
    showMessage,
    message,
    authenticated,
    showAuthMessage,
    token,
    redirect,
    allowRedirect,
  } = props;

  const initialCredential = {
    username: "",
    password: "",
    device_name: "reactapp",
  };

  /*const onLogin = values => {
		showLoading()
		signIn(values);
	};*/

  const onLogin = (values) => {
    showLoading();
    values.device_name = "reactapp";
    JwtAuthService.login(values)
      .then((resp) => {
        hideLoading();
        localStorage.setItem(AUTH_TOKEN, resp.access_token);
        localStorage.setItem(
          USER_INFO,
          new Buffer(JSON.stringify(resp)).toString("base64")
        );
        authenticated(resp.access_token);
      })
      .catch((e) => {
        hideLoading();
        showAuthMessage("Invalid username or password");
        console.log("JwtAuthService error:", e);
      });
  };

  const onGoogleLogin = () => {
    showLoading();
    //signInWithGoogle()
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onFacebookLogin = () => {
    showLoading();
    //signInWithFacebook()
  };

  useEffect(() => {
    if (token !== null && allowRedirect) {
      //history.push(redirect)
      //window.location.reload()
      window.location = redirect;
    }
    if (showMessage) {
      setTimeout(() => {
        hideAuthMessage();
      }, 3000);
    }
  });

  const renderOtherSignIn = (
    <div>
      <Divider>
        <span className="text-muted font-size-base font-weight-normal">
          or connect via
        </span>
      </Divider>
      <div className="d-flex justify-content-center">
        <Button
          className="mr-2"
          disabled={loading}
          icon={<Icon component={AppleOutlined} />}
        >
          iOS
        </Button>
        <Button icon={<Icon component={AndroidOutlined} />} disabled={loading}>
          Android
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, marginBottom: 0 }}
        animate={{
          opacity: showMessage ? 1 : 0,
          marginBottom: showMessage ? 20 : 0,
        }}
      >
        <Alert type="error" showIcon message={message}></Alert>
      </motion.div>
      <Form
        layout="vertical"
        name="login-form"
        initialValues={initialCredential}
        onFinish={onLogin}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[
            {
              required: true,
              message: "Please input your username",
            },
          ]}
        >
          <Input prefix={<UserOutlined className="text-primary" />} />
        </Form.Item>
        <Form.Item
          name="password"
          label={
            <div
              className={`${
                showForgetPassword
                  ? "d-flex justify-content-between w-100 align-items-center"
                  : ""
              }`}
            >
              <span>Password</span>
              {showForgetPassword && (
                <span
                  onClick={() => history.push("/auth/forgot-password")}
                  className="cursor-pointer font-size-sm font-weight-normal text-muted"
                >
                  Forget Password?
                </span>
              )}
            </div>
          }
          rules={[
            {
              required: true,
              message: "Please input your password",
            },
          ]}
        >
          <Input.Password prefix={<LockOutlined className="text-primary" />} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign In
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

LoginForm.propTypes = {
  otherSignIn: PropTypes.bool,
  showForgetPassword: PropTypes.bool,
  extra: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

LoginForm.defaultProps = {
  otherSignIn: true,
  showForgetPassword: true,
};

const mapStateToProps = ({ auth }) => {
  const { loading, message, showMessage, token, redirect } = auth;
  return { loading, message, showMessage, token, redirect };
};

const mapDispatchToProps = {
  showAuthMessage,
  showLoading,
  hideLoading,
  hideAuthMessage,
  authenticated,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
