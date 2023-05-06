let ProductsArray = [];
const ProductsTable = document.getElementById('product-list');
const db = firebase.firestore();
const ProductsRef = db.collection("inventory");
const filterBar = document.getElementById("filter-bar");
document.getElementById('add-filter-btn').addEventListener('click', addFilter);
document.getElementById('search-btn').addEventListener('click', searchBarProducts);
document.getElementById('filter-btn').addEventListener('click', searchFilterProducts);


function addFilter() {
  const filterName = prompt('Enter the name of the new filter:');
  if (filterName) {
    db.collection('Tools').doc('search-filters')
      .update({ filters: firebase.firestore.FieldValue.arrayUnion(filterName) });
  }
}

db.collection('Tools').doc('search-filters')
  .onSnapshot((doc) => {
    const filters = doc.data().filters;
    const filterSelect = document.getElementById('filter-select');
    filterSelect.innerHTML = '';
    filters.forEach((filter) => {
      const option = document.createElement('option');
      option.value = filter;
      option.textContent = filter;
      filterSelect.appendChild(option);
    });
  });

async function searchBarProducts() {
  const searchInput = document.getElementById('search-input').value;
  preDisplayProducts(searchInput);
}

async function searchFilterProducts() {
  const selectedFilter = document.getElementById('filter-select').value;
 preDisplayProducts(selectedFilter);
}



async function readProducts() {
  try {
    const snapshot = await ProductsRef.get();
    snapshot.forEach((doc) => {
      if (doc.exists) {
        ProductsArray.push(doc.data());
      } else {
        console.log("No such document!");
      }
    });
  } catch (error) {
    console.log("Error getting documents:", error);
  }



  preDisplayProducts("all");
}


// filterBar.addEventListener("change", function() {
//   const selectedValue = filterBar.value;
//   preDisplayProducts(selectedValue);
// });

function preDisplayProducts(filter) {
  

if(filter=="הכל")
filter="all";
  ProductsTable.innerHTML = "";
  
  ProductsArray.forEach((ProductData) => {
    if (filter === "all") {
        displayProducts(ProductData);
        
    } else {
      let AuthString = ProductData.product_description;
      if (AuthString.toLowerCase().includes(filter.toLowerCase()))
      displayProducts(ProductData);
    }
  });
}

function displayProducts(ProductData) {
  const row = document.createElement('tr');
  const CatNum = document.createElement('td');
  CatNum.textContent = ProductData.categorial_number;
  const nameCell = document.createElement('td');
  nameCell.textContent = ProductData.product_name;
  nameCell.style.textAlign = "right";
  row.appendChild(CatNum);
  row.appendChild(nameCell);
  ProductsTable.appendChild(row);

  row.addEventListener('click', () => {
    const detailsRow = row.nextElementSibling;
    if (detailsRow && detailsRow.classList.contains('product-details-row')) {
      row.parentElement.removeChild(detailsRow);
    } else {
      const detailsRow = document.createElement('tr');
      detailsRow.classList.add('product-details-row');
      const detailsCell = document.createElement('td');
      detailsCell.colSpan = 8;
      const detailsList = document.createElement('ul');
      const CatNumItem = document.createElement('li');
      CatNumItem.textContent = " מס סידורי: " + ProductData.categorial_number;
      const ProductNameItem = document.createElement('li');
      ProductNameItem.textContent = "שם: " + ProductData.product_name;
      const DescriptionItem = document.createElement('li');
      DescriptionItem.textContent = "תיאור: " + ProductData.product_description;
    //   const emailItem = document.createElement('li');
    //   emailItem.textContent = "Email: " + ProductData.email;
    //   const phoneItem = document.createElement('li');
    //   phoneItem.textContent = "Phone: " + ProductData.phone;
    //   const addressItem = document.createElement('li');
    //   addressItem.textContent = "Address: " + ProductData.address;
    //   const authItem = document.createElement('li');
    //   authItem.textContent = "Authorizations: " + ProductData.Authorizations;
    //   const volunteerTypesItem = document.createElement('li');
    //   volunteerTypesItem.textContent = "Volunteer Types: ";
    //   const volunteerTypesList = document.createElement('ul');
    //   ProductData.volunteerTypes.forEach(type => {
    //     const typeItem = document.createElement('li');
    //     typeItem.textContent = type;
    //     volunteerTypesList.appendChild(typeItem);
    //   });
    //   volunteerTypesItem.appendChild(volunteerTypesList);

    //   const vehiclesItem = document.createElement('li');
    //   vehiclesItem.textContent = "Vehicles: ";
    //   const vehiclesList = document.createElement('ul');
    //   ProductData.vehicles.forEach(vehicle => {
    //     const vehicleItem = document.createElement('li');
    //     vehicleItem.textContent = vehicle;
    //     vehiclesList.appendChild(vehicleItem);
    //   });
    //   vehiclesItem.appendChild(vehiclesList);
    
      detailsList.appendChild(ProductNameItem);
      detailsList.appendChild(CatNumItem);
      detailsList.appendChild(DescriptionItem);
    //   detailsList.appendChild(emailItem);
    //   detailsList.appendChild(phoneItem);
    //   detailsList.appendChild(addressItem);
    //   detailsList.appendChild(authItem);
    //   detailsList.appendChild(volunteerTypesItem);
    //   detailsList.appendChild(vehiclesItem);
      detailsCell.appendChild(detailsList);
      detailsRow.appendChild(detailsCell);
      row.after(detailsRow);
    
      const editProductBtn = document.createElement('button');
      editProductBtn.textContent = 'ערוך מוצר';
      detailsList.appendChild(editProductBtn);
      
      editProductBtn.addEventListener('click', () => {
        const makeEditable = (item, field) => {
          const [label, value] = item.textContent.split(": ");
          const editableValue = document.createElement("span");
          editableValue.contentEditable = true;
          editableValue.textContent = value ? value.trim() : "";
          item.innerHTML = `${label}: `;
          item.appendChild(editableValue);
          editableValue.addEventListener("blur", async () => {
            const newValue = editableValue.textContent.trim();
            try {
              await updateProductField(ProductData.categorial_number, field, newValue);
              if (field === "categorial_number" && newValue !== ProductData.categorial_number) {
                await updateProductDocName(ProductData.categorial_number, newValue);
                ProductData.categorial_number = newValue;
              } else {
                ProductData[field] = newValue;
              }
              item.innerHTML = `${label}: ${newValue}`;
            } catch (error) {
              console.error("Error updating document:", error);
            }
          });
        };
      
        const updateProductField = async (catNum, field, newValue) => {
          try {
            const docRef = db.collection("inventory").doc(catNum);
      
            if (field === "categorial_number") {
              // Update the document name
              await docRef.update({ [field]: newValue });
            } else {
              // Update the field value
              await docRef.update({ [field]: newValue });
            }
          } catch (error) {
            console.error("Error updating document:", error);
            throw error;
          }
        };
      
        const updateProductDocName = async (oldCatNum, newCatNum) => {
          try {
            const oldDocRef = db.collection("inventory").doc(oldCatNum);
            const newDocRef = db.collection("inventory").doc(newCatNum);
      
            const doc = await oldDocRef.get();
            if (doc.exists) {
              // Create a new document with the new categorial number
              await newDocRef.set(doc.data());
              // Delete the old document
              await oldDocRef.delete();
            } else {
              console.error("Document not found:", oldCatNum);
            }
          } catch (error) {
            console.error("Error updating document name:", error);
            throw error;
          }
        };
      
        makeEditable(ProductNameItem, "product_name");
        makeEditable(CatNumItem, "categorial_number");
        // add calls for other category fields as needed
      
        const saveChangesBtn = document.createElement('button');
        saveChangesBtn.textContent = 'Save Changes';
        detailsList.appendChild(saveChangesBtn);
      
        saveChangesBtn.addEventListener('click', () => {
          ProductNameItem.textContent = "שם: " + ProductData.product_name;
          CatNumItem.textContent = "מספר קטגורי: " + ProductData.categorial_number;
          DescriptionItem.textContent = " תיאור: " + ProductData.product_description;
          // update other category fields as needed
      
          nameCell.textContent = ProductData.product_name;
          CatNum.textContent = ProductData.categorial_number;
          // update other table cells as needed
      
          detailsList.removeChild(saveChangesBtn);
        });
      });
      
      

      const deleteProductBtn = document.createElement('button');
deleteProductBtn.textContent = 'מחק מוצר';
detailsList.appendChild(deleteProductBtn);

// Step 2: Add an event listener to the "delete" button
deleteProductBtn.addEventListener('click', async () => {
  // Step 3: Prompt the user to confirm the deletion
  if (confirm("Are you sure you want to delete this product?")) {
    // Step 4: Prompt the user to enter the categorical number
    const enteredCatNum = prompt("Enter the categorial number of the product to confirm:");
    if (enteredCatNum === ProductData.categorial_number) {
      // Step 5: Delete the product from the Firestore database
      try {
        await deleteProductFromFirestore(ProductData.categorial_number);
        location.reload(); // Reload the page to display the updated list
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    } else {
      alert("Incorrect categorial number. Deletion cancelled.");
    }
  }
});

// ... (previous code)

async function deleteProductFromFirestore(CatNum) {
  try {
    await ProductsRef.doc(CatNum).delete();
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}
       



      
    
    }
  });





  
}



// readProducts();    
   

