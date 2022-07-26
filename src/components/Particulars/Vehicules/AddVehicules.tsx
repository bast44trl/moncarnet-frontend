import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { brands, type, upload, vehicule } from '../../../API/request';
import UserContext from '../../../contexts/UserContext';
import IBrand from '../../../Interfaces/IBrand';
import IModel from '../../../Interfaces/IModel';
import IType from '../../../Interfaces/IType';
import {
  button,
  clearedGreenButton,
  glassMorphism,
  input,
  title,
} from '../../../variableTailwind';
import ReturnButton from '../../ReturnButton';

function AddVehicules() {
  const [brandList, setBrandList] = useState<IBrand[]>([]);
  const [modelList, setModelList] = useState<IModel[]>([]);
  const [typeList, setTypeList] = useState<IType[]>([]);
  const [immat, setImmat] = useState<string>('');
  const [typeVehicule, setTypeVehicule] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [modelId, setModelId] = useState<string>('');
  const [registrationDate, setRegistrationDate] = useState<Date>(new Date());
  const [file, setFile] = useState<Blob>();
  const { userLoggedIn, posted, setPosted } = useContext(UserContext);

  async function getBrandModel() {
    let urlBrand = '';
    if (brandFilter) urlBrand += `?name=${brandFilter}`;

    try {
      const getBrand = await brands.getAll(urlBrand);
      setBrandList(getBrand);
      const getType = await type.getAll();
      setTypeList(getType);
      if (getBrand.length === 1) {
        try {
          const getModel =
            getBrand[0].id_brand && (await brands.getModels(getBrand[0].id_brand));
          getModel && setModelList(getModel);
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    setPosted(false);
    getBrandModel();
  }, [brandFilter, modelId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('immat', immat);
    file && formData.append('file', file);
    try {
      const uploadFile = await upload.post(immat, formData);
      if (uploadFile) {
        const postVehicule = await vehicule.post({
          immat: immat.toUpperCase(),
          registration_date: new Date(registrationDate),
          url_vehiculeRegistration: uploadFile.data.url,
          id_modelId: Number(modelId),
          id_typeId: Number(typeVehicule),
          id_userId: Number(userLoggedIn.id_user),
          validate: false,
          active: true,
        });
        if (postVehicule === 200) {
          setPosted(true);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center w-full h-full m-auto lg:max-w-fit">
      <h1 className={title}>Ajouter un véhicule</h1>
      {posted === false && (
        <form
          onSubmit={(e) => handleUpload(e)}
          className={`flex flex-col w-11/12 m-4 rounded-lg p-4 items-center lg:p-8 ${glassMorphism}`}>
          <label className="flex flex-col w-full text-lg font-semibold">
            Immatriculation
            <p className="text-sm">Format (AA-111-AA)</p>
            <input
              className={`valid:outline-valid-500 invalid:outline-error-500 ${input}`}
              type="text"
              name="immat"
              id="immat"
              pattern="[A-Za-z]{2}-[0-9]{3}-[A-Za-z]{2}"
              placeholder="Rentrez votre immatriculation"
              onChange={(e) => setImmat(e.target.value)}
              required
            />
          </label>
          <div className='flex flex-col w-full lg:flex-row lg:justify-between lg:items-center'>
            <label className="flex flex-col w-full lg:w-[30%] lg:h-full text-lg font-semibold">
              Type de véhicule
              <select
                className={`${input} lg:mb-2 lg:w-[100%] lg:text-sm mx-1`}
                name="type"
                id="type"
                required
                onChange={(e) => setTypeVehicule(e.target.value)}>
                <option value="">Selectionnez un type de véhicule</option>
                {typeList.map((el: any) => (
                  <option key={el.id_type} value={el.id_type}>
                    {el.name_type}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col w-full lg:w-[30%] lg:h-full text-lg font-semibold">
              Marque
              <input
                className={`${input} lg:text-sm mx-1`}
                type="text"
                name="brand"
                id="brand"
                list="listBrands"
                placeholder="Selectionnez une marque"
                required
                onChange={(e) => setBrandFilter(e.target.value)}
              />
              <datalist id="listBrands">
                {brandList.map((el: any) => (
                  <option key={el.id_brand} value={el.name}>
                    {el.name}
                  </option>
                ))}
              </datalist>
            </label>
            <label className="flex flex-col w-full lg:w-[30%] lg:h-full text-lg font-semibold">
              Modèle
              <select
                className={`${input} lg:text-sm mx-1`}
                name="model"
                id="model"
                required
                onChange={(e) => setModelId(e.target.value)}>
                <option value="">Selectionner un modèle</option>
                {modelList.map((el: any) => (
                  <option key={el.id_model} value={el.id_model}>
                    {el.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col w-full text-lg font-semibold">
            Date de mise en circulation
            <input
              className={`${input}`}
              type="date"
              name="registrationDate"
              id="registrationDate"
              required
              onChange={(e) => setRegistrationDate(new Date(e.target.value))}
            />
          </label>
          <label className="flex flex-col w-full text-lg font-semibold">
            Télécharger votre carte grise
            <input
              className={`${`${input}`} file:rounded-lg file:border-0 file:p-2 file:text-sm file:hover:cursor-pointer lg:file:mr-4`}
              type="file"
              name="file"
              id="file"
              required
              accept=".jpg, .jpeg, .png"
              onChange={(e) => setFile(e.target.files![0])}
            />
          </label>
          <button className={`w-1/2 ${button}`}>Ajouter</button>
          <div className='w-1/2 flex justify-center items-center'><ReturnButton target='' /></div>
        </form>
      )}
      {posted && (
        <div
          className={`h-4/6 w-10/12 m-4 flex flex-col items-center justify-center rounded-lg ${glassMorphism}`}>
          <h3 className="w-3/4 my-5 text-4xl h-1/6 lg:pt-6">
            Véhicule ajouté avec succès
          </h3>
          <p className="w-3/4 my-5 h-3/6 lg:pt-20">
            Vous pouvez maintenant consulter les informations de votre vehicule depuis
            votre compte utilisateur
          </p>
          <button className={`${clearedGreenButton} w-4/6 my-5 h-1/6 py-2`}>
            <Link to="/particular/vehicules" className="w-full h-full">
              Mes véhicules
            </Link>
          </button>
        </div>
      )}
    </div>
  );
}

export default AddVehicules;
