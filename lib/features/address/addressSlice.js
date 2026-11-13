import { addressDummyData } from '@/assets/assets'
import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [addressDummyData],
    },
    reducers: {
        setAddressList: (state, action) => {
            state.list = action.payload
        },
        addAddress: (state, action) => {
            state.list.push(action.payload)
        },
    }
})

export const { addAddress, setAddressList } = addressSlice.actions

export default addressSlice.reducer