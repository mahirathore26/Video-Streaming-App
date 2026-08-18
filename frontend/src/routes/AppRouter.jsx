import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicRoute from "../components/auth/PublicRoute";
import MainLayout from "../layouts/MainLayout";
import Collections from "../pages/Collections";
import Explore from "../pages/Explore";
import History from "../pages/History";
import Journey from "../pages/Journey";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Playlist from "../pages/Playlist";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import Story from "../pages/Story";
import Studio from "../pages/Studio";
import Upload from "../pages/Upload";
import WriteArticle from "../pages/WriteArticle";
import Article from "../pages/Article";
import ExploreArticles from "../pages/ExploreArticles";
import ReadLater from "../pages/ReadLater";
import Subscriptions from "../pages/Subscriptions";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Explore />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/story/:id" element={<Story />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/article/write" element={<WriteArticle />} />
          <Route path="/article/write/:id" element={<WriteArticle />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/articles" element={<ExploreArticles />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/read-later" element={<ReadLater />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/playlist/:id" element={<Playlist />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
