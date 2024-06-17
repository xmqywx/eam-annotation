// 引入 React 和 Material UI 组件
import React, {Component} from 'react'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Box, Container } from '@mui/material';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';

// 引入 Web Service 工具
import WS from "../../../tools/WS";

class Login extends Component {
    // 组件的状态定义
    state = {
        infor_user: "",
        infor_password: "",
        infor_organization: "",
        infor_tenant: "",
        loginInProgress: false,
    }

    constructor(props){
        super(props);
        // 尝试从 sessionStorage 中恢复登录上下文
        let inforContextString = sessionStorage.getItem('inforContext')
        if (inforContextString) {
            this.props.updateInforContext(JSON.parse(inforContextString));
        }
    }

    // 登录处理函数
    loginHandler = () => {
        // Validate mandatory fields
        // 验证必填字段
        if (!this.state.infor_user || !this.state.infor_password || !this.state.infor_organization) {
            this.props.showError("Please provide valid credentials.")
            return;
        }
        // Login
        // 设置登录进度状态
        this.setState({loginInProgress: true})
        // 调用 WS.login 方法进行登录
        WS.login(this.state.infor_user, this.state.infor_password, this.state.infor_organization, this.state.infor_tenant).then(response => {
            let inforContext = {
                INFOR_ORGANIZATION: this.state.infor_organization,
                INFOR_USER: this.state.infor_user.toUpperCase(),
                INFOR_PASSWORD: this.state.infor_password,
                INFOR_TENANT: this.state.infor_tenant,
                INFOR_SESSIONID: response.body.data,
            }
            // Store in the redux store (used by axios)
            // 更新 Redux store 和 sessionStorage
            this.props.updateInforContext(inforContext)
            // Store in session store (used if page will be refreshed)
            sessionStorage.setItem('inforContext', JSON.stringify(inforContext));
            // Activate all elements again
            // 重置登录进度状态
            this.setState({loginInProgress: false})
        }).catch(error => {
            // 处理登录错误
            this.props.handleError(error);
            this.setState({loginInProgress: false})
        })
    }

    render() {

        return (
                <Container component="main" maxWidth="xs">
                    {/*CssBaseline 组件用于确保跨浏览器的一致性 */}
                    <CssBaseline/>
                    {/* Box 组件用于布局 */}
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: 1
                        }}>
                    <Avatar sx={{ m: 1, bgcolor: '#42a5f5' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        EAM Light Login
                    </Typography>
                    <div>
                            {/* 用户 ID 输入 */}
                            <EAMTextField fullWidth required 
                                   value={this.state.INFOR_USER} label="User ID"
                                   onChange = {value => {this.setState({infor_user: value})}}
                                   disabled={this.state.loginInProgress}
                            />

                            {/* 用于密码输入，设置为密码类型，并自动完成当前密码 */}
                            <EAMTextField fullWidth required type="password" autoComplete="current-password" 
                                   value={this.state.INFOR_PASSWORD} label="Password"
                                   onChange ={value => {this.setState({infor_password: value})}}
                                   disabled={this.state.loginInProgress}
                            />

                            {/* 用于组织名称输入，自动转换为大写 */}
                            <EAMTextField fullWidth required label="Organization" uppercase
                                   value={this.state.INFOR_ORGANIZATION}
                                   onChange ={value => {this.setState({infor_organization: value})}}
                                   disabled={this.state.loginInProgress}
                            />

                            {/* 用于租户名称输入 */}
                            <EAMTextField fullWidth required label="Tenant" 
                                       value={this.state.INFOR_TENANT}
                                       onChange ={value => {this.setState({infor_tenant: value})}}
                                       disabled={this.state.loginInProgress}
                            />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={this.loginHandler}
                            disabled={this.state.loginInProgress}
                            sx={{ color: "white", m: "5px", mt: "15px", mb: "20px" }}
                        >
                           LOG IN
                        </Button>
                    </div>
                    </Box>
                </Container>
        )
    }
}

export default Login;
