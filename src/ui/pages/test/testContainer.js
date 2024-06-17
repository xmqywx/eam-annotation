import {connect} from 'react-redux';
import Test from './test';
import { handleError } from 'actions/uiActions';

function mapStateToProps(state) {
    return {
        userData: state.application.userData
    }
}

const TestContainer = connect(mapStateToProps, {
    handleError
})(Test);

export default TestContainer;