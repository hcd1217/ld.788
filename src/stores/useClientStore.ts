import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {
  type Client,
  type RegisterClientRequest,
  type UpdateClientRequest,
} from '@/lib/api';
import {clientManagementService} from '@/services/clientManagement';

type ClientStoreState = {
  // Client data
  clients: Client[];
  selectedClient: Client | undefined;
  isLoading: boolean;
  error: string | undefined;

  // Actions
  setSelectedClient: (client: Client | undefined) => void;
  loadClients: () => Promise<void>;
  createClient: (data: RegisterClientRequest) => Promise<Client>;
  updateClient: (id: string, data: UpdateClientRequest) => Promise<Client>;
  suspendClient: (id: string) => Promise<void>;
  activateClient: (id: string) => Promise<void>;
  clearError: () => void;

  // Selectors
  getClientById: (id: string) => Client | undefined;
  getClientByCode: (code: string) => Client | undefined;
};

// This store will be created in the next step after the service layer is implemented
export const useClientStore = create<ClientStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      clients: [],
      selectedClient: undefined,
      isLoading: false,
      error: undefined,

      // Actions
      setSelectedClient(client) {
        set({selectedClient: client, error: undefined});
      },

      async loadClients() {
        set({isLoading: true, error: undefined});
        try {
          const response = await clientManagementService.getClients();
          set({
            clients: response.clients,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to load clients';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async createClient(data) {
        set({isLoading: true, error: undefined});
        try {
          // Validate client data first
          const validation = clientManagementService.validateClientData(data);
          if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
          }

          // Check code uniqueness
          const isUnique = await clientManagementService.isClientCodeUnique(
            data.clientCode,
          );
          if (!isUnique) {
            throw new Error(
              `Client code "${data.clientCode}" is already in use`,
            );
          }

          const newClient = await clientManagementService.registerClient(data);
          const updatedClients = [...get().clients, newClient];

          set({
            clients: updatedClients,
            isLoading: false,
          });

          return newClient;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create client';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async updateClient(id, data) {
        set({isLoading: true, error: undefined});
        try {
          const updatedClient = await clientManagementService.updateClient(
            id,
            data,
          );

          const {clients} = get();
          const index = clients.findIndex((c) => c.id === id);

          if (index !== -1) {
            const updatedClients = [...clients];
            updatedClients[index] = updatedClient;

            set({
              clients: updatedClients,
              isLoading: false,
            });

            // Update selected client if it was updated
            if (get().selectedClient?.id === id) {
              set({selectedClient: updatedClient});
            }
          }

          return updatedClient;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update client';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async suspendClient(id) {
        set({isLoading: true, error: undefined});
        try {
          await clientManagementService.suspendClient(id);

          // Update local state
          const {clients} = get();
          const index = clients.findIndex((c) => c.id === id);

          if (index !== -1) {
            const updatedClients = [...clients];
            updatedClients[index] = {
              ...updatedClients[index],
              status: 'suspended',
            };

            set({
              clients: updatedClients,
              isLoading: false,
            });

            // Update selected client if it was suspended
            if (get().selectedClient?.id === id) {
              set({selectedClient: updatedClients[index]});
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to suspend client';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async activateClient(id) {
        set({isLoading: true, error: undefined});
        try {
          await clientManagementService.activateClient(id);

          // Update local state
          const {clients} = get();
          const index = clients.findIndex((c) => c.id === id);

          if (index !== -1) {
            const updatedClients = [...clients];
            updatedClients[index] = {
              ...updatedClients[index],
              status: 'active',
            };

            set({
              clients: updatedClients,
              isLoading: false,
            });

            // Update selected client if it was activated
            if (get().selectedClient?.id === id) {
              set({selectedClient: updatedClients[index]});
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to activate client';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      clearError() {
        set({error: undefined});
      },

      // Selectors
      getClientById(id) {
        return get().clients.find((client) => client.id === id);
      },

      getClientByCode(code) {
        return get().clients.find((client) => client.clientCode === code);
      },
    }),
    {
      name: 'client-store',
    },
  ),
);

// Computed selectors for convenience
export const useClients = () => useClientStore((state) => state.clients);
export const useSelectedClient = () =>
  useClientStore((state) => state.selectedClient);
export const useClientLoading = () =>
  useClientStore((state) => state.isLoading);
export const useClientError = () => useClientStore((state) => state.error);

// Helper hooks for client operations
export const useClientActions = () => {
  const store = useClientStore();
  return {
    setSelectedClient: store.setSelectedClient,
    loadClients: store.loadClients,
    createClient: store.createClient,
    updateClient: store.updateClient,
    suspendClient: store.suspendClient,
    activateClient: store.activateClient,
    clearError: store.clearError,
    getClientById: store.getClientById,
    getClientByCode: store.getClientByCode,
  };
};
