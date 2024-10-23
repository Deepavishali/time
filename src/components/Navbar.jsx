import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#6B7280', // Darker gray
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

export default function Navbar() {

  const [searchValue,setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if(e.key === 'Enter' && searchValue){
      navigate(`/${searchValue}`)
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: 'white', boxShadow: 'none' }}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, paddingBottom: '32px' }}
          >
            <span
              style={{
                backgroundColor: '#6B7280', 
                padding: '2rem',
                borderRadius: '4px',
                transition: 'background-color 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'black')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#6B7280')}
            >
              CLOCK
            </span>
          </Typography>
          <Search>
            <SearchIconWrapper>
            <SearchIcon
            style={{color:'white'}}
            />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{ backgroundColor: '#6B7280', borderRadius: '4px' }} 
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
