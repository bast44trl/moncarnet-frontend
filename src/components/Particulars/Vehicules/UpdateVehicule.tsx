import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { brands, type, upload } from '../../../API/request';
import UserContext from '../../../contexts/UserContext';
import IBrand from '../../../Interfaces/IBrand';
import IModel from '../../../Interfaces/IModel';
import IType from '../../../Interfaces/IType';
import IVehiculeAndUser from '../../../Interfaces/IVehiculeAndUser';
import { button, glassMorphism, input, title } from '../../../variableTailwind';
import ReturnButton from '../../ReturnButton';

function UpdateVehicule() {
  const [brandList, setBrandList] = useState<IBrand[]>([]);
  const [modelList, setModelList] = useState<IModel[]>([]);
  const [typeList, setTypeList] = useState<IType[]>([]);
  const [immat, setImmat] = useState('');
  const [typeVehicule, setTypeVehicule] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [model, setModel] = useState<string>('');
  const [registrationDate, setRegistrationDate] = useState<Date>(new Date());
  const [file, setFile] = useState<Blob>();
  const { infosUserVehicule } = useContext(UserContext);
  const { posted, setPosted } = useContext(UserContext);
  const { vehiculeImmatToUpdate } = useParams();
  const [infosVehicule, setInfosVehicule] = useState<IVehiculeAndUser>();
  const [brand, setBrand] = useState<string>('');
  const refDate = useRef<HTMLInputElement>(null);
  const refCard = useRef<HTMLInputElement>(null);

  async function getInfosVehicule() {
    const filter =
      infosUserVehicule &&
      (await infosUserVehicule.filter((vehicule) => vehicule.immat === vehiculeImmatToUpdate));
    if (filter) setInfosVehicule(filter[0]);
  }

  async function getBrand() {
    if (infosVehicule) {
      const res = await brands.getOne(infosVehicule.brandId);
      setBrand(res.name);
    }
  }

  useEffect(() => {
    infosUserVehicule && getInfosVehicule();
    getBrand();
  }, [infosUserVehicule, infosVehicule]);

  useEffect(() => {
    async function getBrandModel() {
      let urlBrands = '';
      if (brandFilter) urlBrands += `?name=${brandFilter}`;
      try {
        const getBrands = await brands.getAll(urlBrands);
        setBrandList(getBrands);
        const getTypes = await type.getAll();
        setTypeList(getTypes);
        if (getBrands.length === 1) {
          try {
            const getModels =
              getBrands[0].id_brand && (await brands.getModels(getBrands[0].id_brand));
            if (getModels) setModelList(getModels);
          } catch (err) {
            console.log(err);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    getBrandModel();
  }, [brandFilter, model]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    let uploadedGreenCard = undefined;
    try {
      if (file !== undefined && vehiculeImmatToUpdate) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('immat', vehiculeImmatToUpdate);
        const resUpload = await upload.post(vehiculeImmatToUpdate, formData);
        uploadedGreenCard = resUpload.data.url;
      }

      const putVehicule = await axios.put(
        `http://localhost:8000/api/vehicules/${vehiculeImmatToUpdate}`,
        {
          immat: immat.toUpperCase() || vehiculeImmatToUpdate,
          registration_date:
            registrationDate || (infosVehicule && infosVehicule.registrationDate),
          url_vehiculeRegistration:
            uploadedGreenCard || (infosVehicule && infosVehicule.urlGreenCard),
          id_modelId: parseInt(model) || (infosVehicule && infosVehicule.modelId),
          id_typeId: parseInt(typeVehicule) || (infosVehicule && infosVehicule.typeId),
          id_userId: infosVehicule && infosVehicule.userId,
          active: true,
          validate: false,
        },
        {
          withCredentials: true,
        },
      );
      if (putVehicule.status === 204) {
        setPosted(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-6xl lg:h-screen lg:flex lg:flex-col lg:justify-center lg:items-center">
      {posted === false && infosVehicule && (
        <div className="flex flex-col items-center w-full h-full lg:h-5/6 m-auto">
          <h1 className={title}>Modifier votre véhicule</h1>
          <form
            onSubmit={(e) => handleUpdate(e)}
            className={`flex flex-col w-10/12 mt-4 rounded-lg p-4 items-center ${glassMorphism}`}>
            <label className="flex flex-col w-full text-lg font-semibold">
              Immatriculation
              <p className="text-sm">Format (AA-111-AA)</p>
              <input
                className={`valid:outline-valid-500 invalid:outline-error-500 ${input}`}
                type="text"
                name="immat"
                id="immat"
                pattern="[A-Za-z]{2}-[0-9]{3}-[A-Za-z]{2}"
                placeholder={vehiculeImmatToUpdate}
                onChange={(e) => setImmat(e.target.value)}
              />
            </label>
            <div className={`flex flex-col w-full lg:flex-row lg:justify-evenly`}>
              <label className="flex flex-col w-full text-lg font-semibold">
                Type de véhicule
                <select
                  className={`${input} appearance-none`}
                  name="type"
                  id="type"
                  onChange={(e) => setTypeVehicule(e.target.value)}>
                  <option value="">{infosVehicule.type}</option>
                  {typeList.map((el) => (
                    <option key={el.id_type} value={el.id_type}>
                      {el.name_type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col w-full text-lg font-semibold">
                Marque
                <input
                  className={`${input} flex pl-[10%] lg:pl-[3%] appearance-none`}
                  type="text"
                  name="brand"
                  id="brand"
                  list="listBrands"
                  value={brandFilter}
                  placeholder={brand}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  onClick={() => setBrandFilter('')}
                />
                <datalist id="listBrands">
                  {brandList.map((el) => (
                    <option key={el.id_brand} value={el.name}>
                      {el.name}
                    </option>
                  ))}
                </datalist>
              </label>
              <label className="flex flex-col w-full text-lg font-semibold">
                Modèle
                <select
                  className={`${input} appearance-none`}
                  name="model"
                  id="model"
                  onChange={(e) => setModel(e.target.value)}>
                  <option value={model}>{brandFilter ? '' : infosVehicule.model}</option>
                  {modelList.map((el) => (
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
                className={`${input} w-full`}
                type="text"
                ref={refDate}
                onFocus={() => refDate.current && (refDate.current.type = 'date')}
                onBlur={() => refDate.current && (refDate.current.type = 'text')}
                name="registrationDate"
                id="registrationDate"
                placeholder={new Date(
                  infosVehicule.registrationDate,
                ).toLocaleDateString()}
                onChange={(e) => setRegistrationDate(new Date(e.target.value))}
              />
            </label>
            <label className="flex flex-col w-full text-lg font-semibold">
              Votre carte grise
              <input
                className={input}
                type="text"
                name="file"
                id="file"
                ref={refCard}
                onFocus={() => refCard.current && (refCard.current.type = 'file')}
                onBlur={() => refCard.current && (refCard.current.type = 'file')}
                placeholder={infosVehicule && infosVehicule.urlGreenCard.slice(81, infosVehicule.urlGreenCard && infosVehicule.urlGreenCard.length)}
                accept=".jpg, .jpeg, .png"
                onChange={(e) => setFile(e.target.files![0])}
              />
            </label>
            <button className={`w-1/2 lg:max-w-xs ${button}`}>Valider les modifications</button>
          </form>
          <div className='w-1/2 mt-2 mb-5 lg:max-w-xs'><ReturnButton target='' /></div>
        </div>
      )}
      {posted && (
        <div
          className={`h-full w-5/6 my-20 flex flex-col items-center justify-center rounded-lg ${glassMorphism}`}>
          <h3 className="w-3/4 pt-10 mb-10 text-4xl h-3/6 mt-15">
            Véhicule modifié avec succès
          </h3>
          <p className="w-3/4 my-5 h-4/6">
            Vous pouvez maintenant consulter les informations de votre vehicule depuis
            votre compte utilisateur
          </p>
          <Link to="/particular/vehicules">
            <button className={`mb-5 h-1/6 ${button}`}>Mes véhicules</button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default UpdateVehicule;
