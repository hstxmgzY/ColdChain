import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import ProfilePage from '../pages/profile'
import OrderCreatePage from '../pages/orders/create'
import OrderItemsPage from '../pages/orders/create/items'
import OrderConfirmPage from '../pages/orders/confirm'
import OrderPayPage from '../pages/orders/pay'
import OrderDetailPage from '../pages/orders/detail'
import OrderReviewPage from '../pages/orders/review'
import NotificationPage from '../pages/notification'
import OrderItemDetail from '../components/orders/create/item/detail'
import OrderCompletePage from '../pages/orders/complete'

import MainLayout from '../layout/mainLayout'

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* 不带底部导航的页面 */}
        <Route path="/order/item/:index" element={<OrderItemDetail />} />
        <Route path="/order/items" element={<OrderItemsPage />} />
        <Route path="/order/confirm" element={<OrderConfirmPage />} />
        <Route path="/order/pay" element={<OrderPayPage />} />
        <Route path="/order/complete" element={<OrderCompletePage />} />
        <Route path="/order/:id" element={<OrderDetailPage />} />
        <Route path="/order/detail/:id" element={<OrderDetailPage />} />

        {/* 带底部导航的页面 */}
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />
        <Route
          path="/order/create"
          element={
            <MainLayout>
              <OrderCreatePage />
            </MainLayout>
          }
        />
        <Route
          path="/order/review"
          element={
            <MainLayout>
              <OrderReviewPage />
            </MainLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <MainLayout>
              <NotificationPage />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  )
}

export default AppRouter
