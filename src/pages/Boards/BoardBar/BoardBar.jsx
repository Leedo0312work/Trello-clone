import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { Tooltip } from '@mui/material'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { capitalizeFirstLetter } from '~/utils/formatter'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function BoardBar({ board }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: theme => theme.trello.boardBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        paddingX: 2,
        overflowX: 'auto', //Tinh chỉnh scrollbar cuộn over
        bgcolor: theme =>
          theme.palette.mode === 'dark' ? '#34495e' : '#255c8e'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={board?.description}>
          <Chip
            sx={MENU_STYLES}
            icon={<DashboardIcon />}
            label={board?.title}
            clickable
          />
        </Tooltip>
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add to Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': { borderColor: 'white' }
          }}
        >
          Invite
        </Button>

        <AvatarGroup
          max={5}
          sx={{
            gap: '10px',
            '& .MuiAvatar-root': {
              width: 34,
              height: 34,
              fontSize: '16px',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              '&:first-of-type': { bgcolor: '#a4b0be' }
            }
          }}
        >
          <Tooltip title="Leedo">
            <Avatar
              alt="Leedo"
              src="https://www.nawpic.com/media/2020/gojo-nawpic-16-e1627160527336.jpg"
            />
          </Tooltip>
          <Tooltip title="Leedo">
            <Avatar
              alt="Leedo"
              src="https://www.nawpic.com/media/2020/gojo-nawpic-16-e1627160527336.jpg"
            />
          </Tooltip>
          <Tooltip title="Leedo">
            <Avatar
              alt="Leedo"
              src="https://www.nawpic.com/media/2020/gojo-nawpic-16-e1627160527336.jpg"
            />
          </Tooltip>
          <Tooltip title="Leedo">
            <Avatar
              alt="Leedo"
              src="https://www.nawpic.com/media/2020/gojo-nawpic-16-e1627160527336.jpg"
            />
          </Tooltip>
          <Tooltip title="Leedo">
            <Avatar
              alt="Leedo"
              src="https://www.nawpic.com/media/2020/gojo-nawpic-16-e1627160527336.jpg"
            />
          </Tooltip>
          <Tooltip title="Leedo">
            <Avatar
              alt="Leedo"
              src="https://www.nawpic.com/media/2020/gojo-nawpic-16-e1627160527336.jpg"
            />
          </Tooltip>
          <Tooltip title="Leedo">
            <Avatar
              alt="Leedo"
              src="https://www.nawpic.com/media/2020/gojo-nawpic-16-e1627160527336.jpg"
            />
          </Tooltip>

          <Tooltip title="Leedo">
            <Avatar
              alt="Leedo"
              src="https://www.nawpic.com/media/2020/gojo-nawpic-16-e1627160527336.jpg"
            />
          </Tooltip>
          <Tooltip title="Leedo">
            <Avatar
              alt="Leedo"
              src="https://www.nawpic.com/media/2020/gojo-nawpic-16-e1627160527336.jpg"
            />
          </Tooltip>
          <Tooltip title="Leedo">
            <Avatar
              alt="Leedo"
              src="https://www.nawpic.com/media/2020/gojo-nawpic-16-e1627160527336.jpg"
            />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
