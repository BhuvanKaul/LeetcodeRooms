import Home from './pages/home.jsx'
import Room from './pages/room.jsx'
import NotFound from './pages/NotFound.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Home/>
        },
        {
            path: "/lobbies/:lobbyId",
            element: <Room />
        },
        {
            path: '*',
            element: <NotFound />
        }
    ])

    return(
        <RouterProvider router={router}/>
    )
}
export default App
