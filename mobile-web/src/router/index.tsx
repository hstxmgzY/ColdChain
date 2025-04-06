import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProfilePage from '../pages/profile';

import OrderCreatePage from '../pages/orders/create';
import OrderItemsPage from '../pages/orders/items';
import OrderConfirmPage from '../pages/orders/confirm';
import OrderPayPage from '../pages/orders/pay';
import OrderDetailPage from '../pages/orders/detail';
import OrderReviewPage from '../pages/orders/review';

import NotificationPage from '../pages/notification';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/login" />} /> */}
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/order/create" element={<OrderCreatePage />} />
        <Route path="/order/items" element={<OrderItemsPage />} />
        <Route path="/order/confirm" element={<OrderConfirmPage />} />
        <Route path="/order/pay" element={<OrderPayPage />} />
        <Route path="/order/:id" element={<OrderDetailPage />} />
        <Route path="/order/:id/review" element={<OrderReviewPage />} />

        <Route path="/notifications" element={<NotificationPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
