import {Outlet, Navigate} from 'react-router-dom'
import {useSelector} from 'react-redux';

const AdminRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);

    return userInfo?.data?.isAdmin ? <Outlet /> : <Navigate to={"/"} replace />;
}

export default AdminRoute;