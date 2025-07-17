import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {type Client, type RegisterClientRequest} from '@/lib/api';
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
  suspendClient: (clientCode: string, reason: string) => Promise<void>;
  reactivateClient: (clientCode: string) => Promise<void>;
  hardDeleteClient: (
    clientCode: string,
    confirmClientCode: string,
    reason: string,
  ) => Promise<void>;
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

      async suspendClient(clientCode, reason) {
        set({isLoading: true, error: undefined});
        try {
          const updatedClient = await clientManagementService.suspendClient(
            clientCode,
            reason,
          );

          // Update local state
          const {clients} = get();
          const index = clients.findIndex((c) => c.clientCode === clientCode);

          if (index !== -1) {
            const updatedClients = [...clients];
            updatedClients[index] = updatedClient;

            set({
              clients: updatedClients,
              isLoading: false,
            });

            // Update selected client if it was suspended
            if (get().selectedClient?.clientCode === clientCode) {
              set({selectedClient: updatedClient});
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

      async reactivateClient(clientCode) {
        set({isLoading: true, error: undefined});
        try {
          const updatedClient =
            await clientManagementService.reactivateClient(clientCode);

          // Update local state
          const {clients} = get();
          const index = clients.findIndex((c) => c.clientCode === clientCode);

          if (index !== -1) {
            const updatedClients = [...clients];
            updatedClients[index] = updatedClient;

            set({
              clients: updatedClients,
              isLoading: false,
            });

            // Update selected client if it was reactivated
            if (get().selectedClient?.clientCode === clientCode) {
              set({selectedClient: updatedClient});
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to reactivate client';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async hardDeleteClient(clientCode, confirmClientCode, reason) {
        set({isLoading: true, error: undefined});
        try {
          await clientManagementService.hardDeleteClient(
            clientCode,
            confirmClientCode,
            reason,
          );

          // Remove from local state
          const {clients} = get();
          const updatedClients = clients.filter(
            (c) => c.clientCode !== clientCode,
          );

          set({
            clients: updatedClients,
            isLoading: false,
          });

          // Clear selected client if it was deleted
          if (get().selectedClient?.clientCode === clientCode) {
            set({selectedClient: undefined});
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to delete client';
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
    suspendClient: store.suspendClient,
    reactivateClient: store.reactivateClient,
    hardDeleteClient: store.hardDeleteClient,
    clearError: store.clearError,
    getClientById: store.getClientById,
    getClientByCode: store.getClientByCode,
  };
};
