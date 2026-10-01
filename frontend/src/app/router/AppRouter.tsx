import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { allRoutes } from './routes';

export function AppRouter(){
    return (
        <Router>
            <>
                <Routes>
                    {
                        allRoutes.map((route) => (
                            <Route element={<route.element/>} path={route.path} />
                        ))
                    }
                </Routes>
            </>
        </Router>
    )
}