import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider }                   from './contexts/AuthContext'
import { ProfileSettingsProvider }        from './contexts/ProfileSettingsContext'
import { GeneralSettingsProvider }        from './contexts/GeneralSettingsContext'
import { PortfolioSettingsProvider }      from './contexts/PortfolioSettingsContext'
import { CustomerProvider }               from './contexts/CustomerContext'
import { OrdersProvider }                 from './contexts/OrdersContext'
import { TaskProvider }                   from './contexts/TaskContext'
import { InvoiceProvider }                from './contexts/InvoiceContext'
import { ReceiptProvider }                from './contexts/ReceiptContext'
import { PaymentProvider }                from './contexts/PaymentContext'
import { RevenueGoalProvider }            from './contexts/RevenueGoalContext'
import { AppointmentProvider }            from './contexts/AppointmentContext'
import { NotificationProvider }           from './contexts/NotificationContext'
import { PremiumProvider }                from './contexts/PremiumContext'
import { GalleryProvider }                from './contexts/GalleryContext'
import { ReviewProvider }                 from './contexts/ReviewContext'
import { BodyMeasurementImagesProvider }  from './contexts/BodyMeasurementImagesContext'
import { AgentProvider }                  from './contexts/AgentContext'
import { AutonomousAgentProvider }        from './contexts/AutonomousAgentContext'
import { InstallProvider }                from './contexts/InstallContext'
import { BadgeProvider }                  from './contexts/BadgeContext'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <InstallProvider>
        <AuthProvider>
          <GeneralSettingsProvider>
            <ProfileSettingsProvider>
              <PortfolioSettingsProvider>
                <PremiumProvider>
                  <BodyMeasurementImagesProvider>
                    <CustomerProvider>
                      <GalleryProvider>
                        <ReviewProvider>
                          <OrdersProvider>
                            <TaskProvider>
                              <InvoiceProvider>
                                <ReceiptProvider>
                                  <PaymentProvider>
                                    <RevenueGoalProvider>
                                      <AppointmentProvider>
                                        <BadgeProvider>
                                          <AutonomousAgentProvider>
                                            <AgentProvider>
                                              <NotificationProvider>
                                                <App />
                                              </NotificationProvider>
                                            </AgentProvider>
                                          </AutonomousAgentProvider>
                                        </BadgeProvider>
                                      </AppointmentProvider>
                                    </RevenueGoalProvider>
                                  </PaymentProvider>
                                </ReceiptProvider>
                              </InvoiceProvider>
                            </TaskProvider>
                          </OrdersProvider>
                        </ReviewProvider>
                      </GalleryProvider>
                    </CustomerProvider>
                  </BodyMeasurementImagesProvider>
                </PremiumProvider>
              </PortfolioSettingsProvider>
            </ProfileSettingsProvider>
          </GeneralSettingsProvider>
        </AuthProvider>
      </InstallProvider>
    </BrowserRouter>
  </React.StrictMode>
)

registerSW({
  onNeedRefresh() {
    window.location.reload()
  },
  onOfflineReady() {},
})
