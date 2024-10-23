import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";

const initialState = {
    Location: {},
  Time: {},
  isLoading: false,
  error: "",
};

const Base_URL = "https://timeapi.io/api";

export const getTime = createAsyncThunk(
  "time/getTime",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`${Base_URL}/timezone/coordinate?latitude=${data.latitude}&longitude=${data.longitude}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      const result = await response.json();
      const statusCode = response.status;
      if (response.ok) {
        return { statusCode, data: result };
      } else {
        return rejectWithValue({ error: result });
      }
    } catch (error) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const getLocation = createAsyncThunk(
  "time/getLocation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch( `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.latitude}&lon=${data.longitude}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
          },
        }
      );
      const result = await response.json();
      const statusCode = response.status;
      if (response.ok) {
        return { statusCode, data: result };
      } else {
        return rejectWithValue({ error: result });
      }
    } catch (error) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export  const getCoordinates = createAsyncThunk(
  "Time/getCoordinates",
  async (data,{rejectWithValue})=>{
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${data}&format=json`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
          },
        }
      );
      const result = await response.json();
      const statusCode = response.status;
      if (response.ok) {
        return { statusCode, data: result };
      } else {
        return rejectWithValue({ error: result });
      }
    } catch (error) {
      return rejectWithValue({ error: error.message });
    }

  }
)


const TimeSlice = createSlice({
  name: "Time",
  initialState,
  extraReducers: (builder) => {
    builder
      // Handling getTime
      .addCase(getTime.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTime.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Time = action.payload;
        state.error = "";
      })
      .addCase(getTime.rejected, (state, action) => {
        state.isLoading = false;
        state.Time = {};
        state.error = action.payload?.error || "Failed to fetch time data";
      })
      // Handling getLocation
      .addCase(getLocation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Location = action.payload;
        state.error = "";
      })
      .addCase(getLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.Location = {};
        state.error = action.payload?.error || "Failed to fetch location data";
      })
      .addCase(getCoordinates.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCoordinates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Location = action.payload;
        state.error = "";
      })
      .addCase(getCoordinates.rejected, (state, action) => {
        state.isLoading = false;
        state.Location = {};
        state.error = action.payload?.error || "Failed to fetch location data";
      }) 
  },
});

export default TimeSlice.reducer;