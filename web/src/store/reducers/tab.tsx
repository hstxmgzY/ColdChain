import { createSlice } from '@reduxjs/toolkit';

const tabSlice = createSlice({
    name: 'tab',
    initialState:{
        isCollapsed: false
    },
    reducers:{
        collapseMenu: state => {
            state.isCollapsed = !state.isCollapsed
        }
    }
})

export const { collapseMenu } = tabSlice.actions
export default tabSlice.reducer