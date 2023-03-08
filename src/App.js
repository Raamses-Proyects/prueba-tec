import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
const mensaje = "No se permite salir de recuadro";

const App = () => {

  // States
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);


  // Funciones
  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    // console.log(newComponent);
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    const [ { left, top } ] = updatedMoveables;

    if( left === 700 || left <= -5 ) {
      alert(mensaje);
      return
    }

    if( top <= -5 || top > 510 ) {
      alert(mensaje);
      return
    }
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    console.log(handlePosX);
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height : "1000px", width: "1000px" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "600px",
          width: "800px",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;



const Component = ({ updateMoveable, top, left, width, height, index, color, id, setSelected, isSelected = false, updateEnd}) => {
    
  // Hooks
  const ref = useRef();
  const [nodoReferencia, setNodoReferencia] = useState({ top, left, width, height, index, color, id});


  // Variables
  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  

  // Funciones
  const onResize = async (e) => { // redimencionar
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
    newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
    newWidth = parentBounds?.width - left;

      
    updateMoveable(id, { top, left, width: newWidth, height: newHeight, color });


    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];
    
    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    // console.log('Top:', top + translateY < 0 ? 0 : top + translateY);
    let t = top + translateY < 0 ? 0 : top + translateY;
    if( t === 5 || t > 522 ) {
      alert(mensaje);
      return
    }

    // console.log('Left:', left + translateX < 0 ? 0 : left + translateX);
    let l = left + translateX < 0 ? 0 : left + translateX;
    if( l === 5 ) {
      alert(mensaje);
      return
    } 

    setNodoReferencia({
      ...nodoReferencia,
      translateX, 
      translateY,
      top: t,
      left: l,
    });
  };


  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    if( lastEvent !== undefined ) {
      const { drag } = lastEvent;
      const { beforeTranslate } = drag;
      const absoluteTop = top + beforeTranslate[1];
      const absoluteLeft = left + beforeTranslate[0];
      updateMoveable( id, { top: absoluteTop, left: absoluteLeft, width: newWidth, height: newHeight, color }, true);
    }
    // const { beforeTranslate } = drag;
    // const absoluteTop = top + beforeTranslate[1];
    // const absoluteLeft = left + beforeTranslate[0];
    // updateMoveable( id, { top: absoluteTop, left: absoluteLeft, width: newWidth, height: newHeight, color }, true);
  };


  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
