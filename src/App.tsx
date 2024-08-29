"use client";
import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  //logIn
  const logInUser = () => {
    const userRequestDTO = { username, password };
    axios.post('/api/user/login', userRequestDTO)
      .then(function (res) {
        setLogin(true);
      })
      .catch(function (error) {
        console.error('Error:', error);
        setLogin(false);
      });
  };

  //logout
  const logOut = () => {
    axios.post('/api/user/logout')
      .then(function (res) {
        setLogin(false);
      })
      .catch(function (error) {
        console.error('Error:', error);
        setLogin(false);
      });
  };

  // get Store List
  const getStoreList = () => {
    axios.get('/api/store/list')
      .then(r => {
        setStoreList(r.data);
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  };

  //select store table
  const select = () => {
    const storeTableId = targetTable?.id;
    axios.put('/api/store/select', null, {
      headers: {
        'storeTableId': storeTableId
      }
    })
      .then(r => {
        getMenuList();
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  };

  //get menu list
  const getMenuList = () => {
    axios.get('/api/store/menuList', {
      headers: {
        'storeId': targetStore?.id
      }
    })
      .then(r => {
        setSelectStore(true);
        setMenuList(r.data);
      })
      .catch(function (error) {
        console.error('Error:', error);
        setSelectStore(false);
      });
  };

  //get menu detail
  const menuDetail = (menu: StoreMenuResponseDTO) => {
    axios.get('/api/store/menu', {
      headers: {
        'storeMenuId': menu?.id
      }
    })
      .then(r => {
        setTargetMenu(r.data);
      })
      .catch(function (error) {
        console.error('Error:', error);
        setSelectStore(false);
      });
  };

  //add cart
  const addCart = () => {
    const storeMenuId = targetMenu?.id;
    const count = menuCount;
    const cartRequestDTO = { storeMenuId, count };
    axios.post('/api/cart', cartRequestDTO)
      .then(r => {
        getCartList();
      })
      .catch(function (error) {
        console.error('Error:', error);
        alert('이미 장바구니에 담겨있습니다.');
      });
  };

  //drop cart
  const dropCart = (cartId: number) => {
    axios.delete('/api/cart', {
      headers: {
        'cartId': cartId
      }
    })
      .then(r => {
        setCartList(r.data);
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  };

  //get cart List
  const getCartList = () => {
    axios.get('/api/cart')
      .then(r => {
        setCartList(r.data);
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  };

  //cart Update
  const cartUpdate = (id: number, newCount: number) => {
    axios.put('/api/cart', null, {
      headers: {
        'cartId': id,
        'count': newCount
      }})
      .then(r => {
        const index = cartList.findIndex(e => e.id === r.data.id);
        const pre = [...cartList];
        pre[index] = r.data;
        setCartList(pre);
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  };

  //order
  const orderMenu = () => {
    if (!myOrder){
      axios.post('/api/order')
      .then(r => {
        setMyOrder(r.data);
        getCartList();
        alert('주문이 성공적으로 생성되었습니다!');
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
    }else {
      alert('이미 주문이 존재합니다.');
    }
  };

  //order complete
  const completeOrder = () => {
    axios.put('/api/order/complete', null, {
      headers: {
        'orderId': myOrder?.id
      }})
      .then(r => {
        setMyOrder(r.data);
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  };

  //order cancel
  const cancelOrder = () => {
    axios.put('/api/order/cancel', null, {
      headers: {
        'orderId': myOrder?.id
      }})
      .then(r => {
        setMyOrder(r.data);
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  };

  interface StoreTableResponseDTO {
    id: number;
    store: string;
    myTable: string;
  }

  interface StoreResponseDTO {
    id: number;
    name: string;
    storeTablesDTO: StoreTableResponseDTO[];
  }

  interface StoreMenuResponseDTO {
    id: number;
    name: string;
    price: string;
  }

  interface MenuResponseDTO {
    id: number;
    name: string;
    price: string;
    content: string;
  }

  interface CartResponseDTO {
    id: number;
    storeTable: StoreTableResponseDTO;
    storeMenu: StoreMenuResponseDTO;
    count: number;
    total: number
  }

  interface MyOrderResponseDTO {
    id: number;
    orderMenuDTO: OrderMenuDTO[];
    totalPrice: number;
    status: number;
    orderTime: number
  }

  interface OrderMenuDTO {
    id: number;
    menu: string;
    price: number;
    count: number;
    total: number
  }

  const handleChange = (e: any) => {
    const value = Math.max(1, Number(e.target.value) || 1);
    setMenuCount(value);
  };

  const handleQuantityChange = (e: any, id: number) => {
    const newCount = Math.max(1, Number(e.target.value)); 
    cartUpdate(id, newCount);
  };

  const getDateTime = (data: any) => {
    const date = new Date(data);
    const hours = date.getHours();
    const amPm = hours >= 12 ? '오후' : '오전';
    const formattedHour = hours % 12 || 12;
    const formattedTime = amPm + " " + (formattedHour < 10 ? '0' + formattedHour : formattedHour) + ":"
      + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

    return date.getFullYear() + "년 " +
      (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + "월 "
      + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + "일 " + formattedTime;
  }

  // Approver 승인자 상태 매핑 함수
  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return "confirm";
      case 1:
        return "cancle";
      case 2:
        return "complete";
      default:
        return "";
    }
  };

  // Approver 승인자 색상 매핑 함수
  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0:
        return "text-yellow-500"; // 결재 대기중
      case 1:
        return "text-red-500"; // 결재 중
      case 2:
        return "text-green-500"; // 허가
      default:
        return "text-black"; // 알 수 없음
    }
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState(false);
  const [targetStore, setTargetStore] = useState<StoreResponseDTO | null>(null);
  const [targetTable, setTargetTable] = useState<StoreTableResponseDTO | null>(null);
  const [storeList, setStoreList] = useState<StoreResponseDTO[]>([]);
  const [tableList, setTableList] = useState<StoreTableResponseDTO[]>([]);
  const [selectStore, setSelectStore] = useState(false);
  const [menuList, setMenuList] = useState<StoreMenuResponseDTO[]>([]);
  const [targetMenu, setTargetMenu] = useState<MenuResponseDTO | null>(null);
  const [menuCount, setMenuCount] = useState(1);
  const [cartList, setCartList] = useState<CartResponseDTO[]>([]);
  const [myOrder, setMyOrder] = useState<MyOrderResponseDTO | null>(null);
  const [orderMenuList, setOrderMenuList] = useState<OrderMenuDTO[]>([]);

  useEffect(() => {
    if (targetStore) {
      setTableList(targetStore?.storeTablesDTO);
    }
  }, [targetStore]);

  useEffect(() => {
    if (myOrder) {
      setOrderMenuList(myOrder.orderMenuDTO);
    }
  }, [myOrder]);

  return (
    <div className="App">
      <div className='logIn'>
        <input
          className='id'
          placeholder='id'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className='password'
          type='password'
          placeholder='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {login ? (
          <button
            onClick={logOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Log Out
          </button>
        ) :
          <button
            onClick={logInUser}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Log In
          </button>}
        <button
          className={`px-4 py-2 rounded text-white ${login ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
        >
          {login ? 'Logged In' : 'Not Logged In'}
        </button>
      </div>
      {login && ( // 로그인 상태가 true일 때만 div를 렌더링
        <div className='mt-4 p-4 border border-gray-300 rounded bg-gray-100'>
          <p>로그인 상태인 경우만 보이는 div입니다.</p>
          <p>select = store : {targetStore?.name} / table : {targetTable?.myTable}
          </p>
          <div className='flex'>
            <div className='w-[50%] bg-red-300'>
              <button onClick={getStoreList}>store</button>
              {storeList.map((store, index) => (
                <div key={index}
                  className=
                  {`border-2 border-gray-300 rounded-lg shadow-md flex justify-between ${store.id === targetStore?.id ? 'bg-blue-100' : ''
                    }`}>
                  <h4 className="flex items-center justify-center font-bold w-[80%]" onClick={() => { setTargetStore(store) }}>
                    {store.name}
                  </h4>
                </div>
              ))}
            </div>
            <div className='w-[50%] bg-blue-300'>
              {tableList.map((table, index) => (
                <div key={index}
                  className=
                  {`border-2 border-gray-300 rounded-lg shadow-md flex justify-between ${table.id === targetTable?.id ? 'bg-blue-100' : ''
                    }`}>
                  <h4 className="flex items-center justify-center font-bold w-[80%]" onClick={() => { setTargetTable(table) }}>
                    {table?.myTable}
                  </h4>
                </div>
              ))}
            </div>
          </div>
          <button className='bg-green-500 text-white px-4 py-2 mt-2 rounded hover:bg-green-600' onClick={select}>선택</button>
          <p>============================================</p>
          {selectStore &&
            <div className='flex'>
              <div className='w-[50%] bg-red-300'>
                <button onClick={getMenuList}>menu</button>
                {menuList.map((menu, index) => (
                  <div key={index}
                    className={`border-2 border-gray-300 rounded-lg shadow-md flex justify-between ${menu.id === targetMenu?.id ? 'bg-blue-100' : ''
                      }`}>
                    <h4 className="flex items-center justify-center font-bold w-[80%]" onClick={() => { menuDetail(menu) }}>
                      {menu.name}
                    </h4>
                  </div>
                ))}
              </div>
              <div className='w-[50%] bg-blue-300 flex flex-col justify-center items-center'>
                {targetMenu &&
                  <><p> NAME : {targetMenu.name}</p>
                    <p> Price : {targetMenu.price}</p>
                    <p> Content : {targetMenu.content}</p></>
                }
                <input type="number" min="1" placeholder='count' className='w-[60%]' value={menuCount}
                  onChange={handleChange} />
                <button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                  onClick={addCart}>
                  담기</button>
              </div>
            </div>}
        </div>
      )}
      {login && (
        <div className="mt-4 p-4 border border-gray-500 rounded bg-gray-100">
          <p className="text-lg font-bold mb-4">장바구니</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-300">
                <th className="p-2 text-center">메뉴</th>
                <th className="p-2 text-center">가격</th>
                <th className="p-2 text-center">수량</th>
                <th className="p-2 text-center">총계</th>
                <th className="p-2 text-center">제거</th>
              </tr>
            </thead>
            <tbody>
              {cartList.map((cart, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="p-2">{cart?.storeMenu?.name}</td>
                  <td className="p-2">{cart?.storeMenu?.price}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={cart.count}
                      onChange={(e) => handleQuantityChange(e, cart.id)}
                      min="1"
                      className="w-full"
                    /></td>
                  <td className="p-2">{cart.total}</td>
                  <td className="p-2">
                    <button className='bg-red-300 rounded px-4 py-2' onClick={() => dropCart(cart?.id)}>-</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className='bg-blue-500 text-white px-4 py-2 mt-2 rounded hover:bg-blue-600' onClick={orderMenu}>주문</button>
        </div>
      )}


      {login && (
        <div className='mt-4 p-4 border border-gray-500 rounded bg-gray-100'>
          <p>주문</p>
          {myOrder &&
            <div className='flex'>
              <div className="w-[50%] bg-white-300 p-4 rounded-lg shadow-md">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 font-semibold">총 가격</td>
                      <td className="p-2">{myOrder.totalPrice} 원</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 font-semibold">주문 시간</td>
                      <td className="p-2">{getDateTime(myOrder.orderTime)}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 font-semibold">상태</td>
                      <td className={`p-2 ${getStatusColor(myOrder.status)}`}>
                        {getStatusText(myOrder.status)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button className='bg-green-500 text-white px-4 py-2 mt-2 mr-2 rounded hover:bg-green-600' onClick={completeOrder}>승인</button>
                <button className='bg-red-500 text-white px-4 py-2 mt-2 rounded hover:bg-red-600' onClick={cancelOrder}>거절</button>
              </div>
              <div className="w-full bg-white p-4 rounded-lg shadow-md">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-300">
                      <th className="p-2 text-center">메뉴</th>
                      <th className="p-2 text-center">가격</th>
                      <th className="p-2 text-center">수량</th>
                      <th className="p-2 text-center">총계</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderMenuList.map((menu, index) => (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="p-2">{menu.menu}</td>
                        <td className="p-2">{menu.price}</td>
                        <td className="p-2">{menu.count}</td>
                        <td className="p-2">{menu.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>}
        </div>
      )}
    </div>
  );
}

export default App;