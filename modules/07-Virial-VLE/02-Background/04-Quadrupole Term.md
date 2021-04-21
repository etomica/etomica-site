

For a small molecule such as CO<sub>2</sub> molecule it is possible to perform a fairly high–level ab–initio computation
of the quadrupole moment tensor elements $Q_{\alpha\beta}$ . As an example, for an isolated CO<sub>2</sub> molecule at zero Kelvin a calculation at the ab–initio CCSD/cc-pVTZ level of theory (including geometry optimization) with the Gaussian 03 code yielded the following result:


Quadrupole moment (field-independent basis, *debye*$\cdot$&Aring;):

XX= -14.6739 YY= -14.6739 ZZ= -19.8172

XY= 0.0000 XZ= 0.0000 YZ= 0.0000


for the CO<sub>2</sub> molecule aligned with the z–axis and the carbon atom at the coordinate origin. The optimized
C=O bond length was 1.159 &Aring; which is very close to the experimental bond length of 1.162 &Aring; obtained by Herzberg (1966) as [retreived from the CCCBDB.](http://srdata.nist.gov/cccbdb/) (accessed in Feb. 2008, it was not explicitly stated whether the experiment refers to $R_0$ or $R_e$, we assume it is the equilibrium value $R_e$).

The Gaussian code outputs the Cartesian quadrupole moments, i.e. instead of Eq. (5) it calculates and
prints

$q_{\alpha \beta} = \int dr \cdot \rho(r)r_\alpha r_\beta$    ..... (Equation 8)



This q–tensor is not traceless. The conversion to Eq. (5) is done via

$Q_{\alpha \beta} = \frac{1}{2} [ 3q_{\alpha \beta} - \delta_{\alpha \beta}(q_{xx} + q_{yy} + q_{zz})]$    ..... (Equation 9)



so $Q_{zz} = \frac{1}{2}[3q_{zz} - (q_{xx} + q_{yy} + q_{zz})] = \frac{1}{2}[2q_{zz} - q_{xx} - q_{yy}]$

For CO<sub>2</sub>, because of rotational symmetry we have $q_{xx} = q_{yy}$, therefore $Q_{zz} = q_{zz} - q_{xx}$.
From the computed data above, we obtain $Q_{zz}$ = -5.1433.
For the linear CO<sub>2</sub> molecule the magnitude of this value is the quadrupole moment Q, the numerical parameter that is adjusted in the module Virial along with the LJ parameters $\epsilon$ and $\sigma$ to fit the experimental B(T) data. The quadrupole moment is also one of the parameters that can be supplied as input for the VLE module to simulate the phase equilibrium. The units of Q are usually given in *debye*$\cdot$&Aring;, *i.e.* a dipole moment units multiplied with a length unit. Both are “atomic scale” units appropriate to describe the quadrupole moment of a single molecule.