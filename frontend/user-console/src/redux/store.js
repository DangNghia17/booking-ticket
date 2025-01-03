import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./slices/accountSlice";
import customerReducer from "./slices/customerSlice";
import eventReducer from "./slices/eventSlice";
import searchReducer from "./slices/searchSlice";
import routeReducer from "./slices/routeSlice";
import filterReducer from "./slices/filterSlice";
import ticketReducer from "./slices/ticketSlice";
import generalReducer from "./slices/generalSlice";
import storage from "redux-persist/lib/storage";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";

const accountPersistConfig = {
  key: "account",
  version: 1,
  storage,
};
const routePersistConfig = {
  key: "route",
  version: 1,
  storage,
};
const ticketPersistConfig = {
  key: "ticket",
  version: 1,
  storage,
};
const accountPersistedReducer = persistReducer(
  accountPersistConfig,
  accountReducer
);
const routePersistedReducer = persistReducer(routePersistConfig, routeReducer);
const ticketPersistedReducer = persistReducer(
  ticketPersistConfig,
  ticketReducer
);
export const store = configureStore({
  reducer: {
    account: accountPersistedReducer,
    customer: customerReducer,
    event: eventReducer,
    general: generalReducer,
    route: routePersistedReducer,
    search: searchReducer,
    filter: filterReducer,
    ticket: ticketPersistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export const persistor = persistStore(store);
setupListeners(store.dispatch);
