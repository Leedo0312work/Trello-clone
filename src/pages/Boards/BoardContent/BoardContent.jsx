import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'

import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {
  // https://docs.dndkit.com/api-documentation/sensors
  // Dùng PointerSensor mặc định thì kết hợp thuộc tính CSS touch-action: none ở những phần tử kéo thả
  // Require the mouse to move by 10 pixels before activating
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // Yêu cầu chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  //Nhấn dữ 250ms và dung sai của cảm ứng chênh lệch 500px
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  //Ưu tiên sử dụng kết hợp 2 loại sensor : mouse và touch cho trải nghiệm mobile-enhance
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumnsState, setOderedColumsState] = useState([])

  //Xác định loại phần tử kéo trong 1 thời điểm
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  // In order to take start column, add state for it because state will change in handleDragOver
  const [oldColumnDraggingCard, setOldColumnDraggingCard] = useState(null)


  useEffect(() => {
    const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id')
    setOderedColumsState(orderedColumns)
  }, [board])

  const findColumnByCardId = (cardId) => {
    return orderedColumnsState.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // Xử lý cập nhật state trong trường hợp di chuyển card giữa các column
  const moveCardBetweenDiffCols = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOderedColumsState(prevColumns => {
      //TÌm vị trí của card sắp được kéo đến
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      //Xử lý trạng thái cho card index mới - lib
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn.length + 1

      //Clone mảng orderedColumnState cũ ra mảng mới để xử lý và cập nhật sau -lib
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)



      if (nextActiveColumn) {
        // Xóa card ở column đang active, cập nhật lại dữ liệu mảng card
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
        //Cập nhật lại mảng cardOrderIds
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      if (nextOverColumn) {
        //Kiểm tra card đang kéo có tồn tại ở overColumn chưa, nếu có thì xóa trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        //Cập nhật lại columnId của activeDraggingCardData
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }

        //Thêm card đang kéo(activeDraggingCardData) vào overColumn theo vị trí index mới(newCardIndex)
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        //Cập nhật lại mảng cardOrderIds
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }
      return nextColumns
    })
  }

  const handleDragStart = (event) => {
    //console.log('handleDragStart: ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    //Nếu kéo card sẽ xét giá trị cho old column
    if (event?.active?.data?.current?.columnId) {
      setOldColumnDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  const handleDragOver = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    //console.log('Handle drag over: ', event)
    const { active, over } = event

    if (!active || !over) return

    // activeDraggingCardId : card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCardId: card đang được tương tác
    const { id: overCardId } = over

    //Tìm 2 column theo card ID
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    //Nếu không tồn tại 1 trong 2 column
    if (!activeColumn || !overColumn) return

    //Xử lý khi kéo card qua 2 column khác nhau
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDiffCols(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }
  }

  const handleDragEnd = (event) => {
    //console.log('handleDragEnd: ', event)
    const { active, over } = event

    //Check over and active
    if (!active || !over) return
    //DND card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCardId : card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCardId: card đang được tương tác
      const { id: overCardId } = over

      //Tìm 2 column theo card ID
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      if (!activeColumn || !overColumn) return

      //Xử lý thả giữa 2 column
      if (activeDragItemData.columnId !== overColumn._id) {
        //if (oldColumnDraggingCard._id !== overColumn._id) {
        moveCardBetweenDiffCols(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )
      }
      else {
        //Lấy vị trí cũ từ oldColumnDraggingCard
        const oldCardIndex = oldColumnDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        //Lấy vị trí mới từ oldColumnDraggingCard
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        const dndOrderedCards = arrayMove(oldColumnDraggingCard?.cards, oldCardIndex, newCardIndex)
        setOderedColumsState(prevColumns => {
          //Clone mảng orderedColumnState cũ ra mảng mới để xử lý và cập nhật sau -lib
          const nextColumns = cloneDeep(prevColumns)
          //Tìm tới column đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)

          return nextColumns
        })
      }
    }

    //DND Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && active.id !== over.id) {
      //Lấy vị trí cũ từ active
      const oldColumnIndex = orderedColumnsState.findIndex(c => c._id === active.id)
      //Lấy vị trí mới từ over
      const newColumnIndex = orderedColumnsState.findIndex(c => c._id === over.id)
      //arrayMove (dnd-kit): sắp xếp lại mảng Columns ban đầu
      const dndOrderedColumns = arrayMove(orderedColumnsState, oldColumnIndex, newColumnIndex)
      // Xử lý dữ liệu gọi API:
      // const dndOrderedColumnsIDs = dndOrderedColumns.map(c => c._id)
      // console.log('dndOrderedColumns: ', dndOrderedColumns)
      // console.log('dndOrderedColumnsIDs: ', dndOrderedColumnsIDs)

      //Cập nhật lại state columns ban đầu sau khi kéo thả
      setOderedColumsState(dndOrderedColumns)
    }


    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnDraggingCard(null)
  }

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: 0.5
        }
      }
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0' //padding cho thanh scroll
      }}>
        <ListColumns columns={orderedColumnsState} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} />}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
