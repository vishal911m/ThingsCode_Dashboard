import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ModalMode = 'add' | 'edit' | null

interface UiState {
  modalMode: ModalMode
  activeMachine: any | null
  showDeleteModal: boolean;
  selectedDate: Date;
}

const initialState: UiState = {
  modalMode: null,
  activeMachine: null,
  showDeleteModal: false,
  selectedDate: new Date(),
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /* ========================
       ADD / EDIT MODAL
    ======================== */
    openAddModal: (state) => {
      state.modalMode = 'add'
      state.activeMachine = null
    },
    openEditModal: (state, action: PayloadAction<any>) => {
      state.modalMode = 'edit'
      state.activeMachine = action.payload
    },
    closeModal: (state) => {
      state.modalMode = null
      state.activeMachine = null
    },
    /* ========================
       DELETE MODAL
    ======================== */
    openDeleteModal: (state, action: PayloadAction<any>) => {
      state.showDeleteModal = true;
      state.activeMachine = action.payload;
    },
    closeDeleteModal: (state) => {
      state.showDeleteModal = false;
      state.activeMachine = null;
    },
    /* ========================
       DATE SELECTION
    ======================== */
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload
    },
  },
})

export const {
  openAddModal,
  openEditModal,
  closeModal,
  openDeleteModal,
  closeDeleteModal,
  setSelectedDate,
} = uiSlice.actions

export default uiSlice.reducer
