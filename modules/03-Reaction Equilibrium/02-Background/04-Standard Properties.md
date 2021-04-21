

The thermodynamic chemical potential $\mu$ of a component *i* in a mixture can be separated into several contributions

$$
\mu_i = \mu^0_2(T) + kT ln\rho + kT lnx_i + kT ln\phi_i
$$


where $\rho$ is the number (or molar) density, $x_i$ is the mole fraction, and $\phi.$ is the fugacity coefficient. $\mu^0_i$involves contributions to the chemical potential that (as indicated) depend only on temperature $T$; $k$ is Boltzmann's constant. If we define a &quot;standard state&quot; as one where the substance behaves as an ideal gas $(\phi_i = 1)$, is a pure component $(x_i = 1)$, and is at unit density $(\rho = 1)$, then all the other terms drop out, and the chemical potential is just $\mu^0_i$.  Thus a fancy way to refer to $\mu^0_i$is as &quot;the standard-state chemical potential for the pure substance in the ideal-gas state at unit density.&quot;  Note that we're not saying that such a state exists physically; we're just saying that we're ignoring all those other contributions to the chemical potential and looking just at $\mu^0_i$.  Because for a pure substance the chemical potential equals the molar Gibbs free energy, $\mu^0_i$ is more commonly referred to as the standard-state  free energy.

The other contributions originate from the intermolecular interactions (causing $\phi_i$ to differ from unity), and the entropic contributions that involve counting distinguishable permutations of the positions of atoms of different species, and the center-of-mass movement of the molecules through the system's volume. If these are neglected, then the remaining contributions to $\mu_i$ come from the properties of a single molecule of species *i* considered in isolation.  Thus we can develop expressions for $\mu^0_i$ by examining a single molecule of that species.

Statistical mechanics says that $\mu^0_i$ can be evaluated by summing all the distinguishable states of a single molecule holding its center of mass fixed, with each state weighted by the Boltzmann factor, $\exp(-u/kT)$, where *u* is the energy.  In particular

$\exp(-\mu^0_i/kT) = \sum_{states}\exp(-u/kT)$


For the monatomic species, there is only one state, which we take to have zero energy.  So for these species the standard-state free energy is zero

$\mu^0_R = \mu^0_B = 0$


For the dimeric species, the sum over states is an integral in which the atoms are integrated over all positions for which their separation *r* is within the attractive region $\Kappa \sigma < r < \sigma$ and the center of mass is fixed.  The energy is the same for all such states, equal to negative $\epsilon$.  The value of this integral is equal to the volume of the spherical shell where the radius is between the limiting values.

$\exp(-\mu^0_{dimer}/kT) = \frac{1}{\sum}\pi\sigma^2(1-\kappa^2)\exp(+\varepsilon/kT)$


or

$$
\mu^0_{dimer} = \varepsilon - kT \ln \left [\pi\sigma^2(1-\kappa^2)/\sum \right ]
$$



Two points to note.&nbsp;&nbsp;First, this is written for a two-dimensional system.  Second is the presence of the factor $\Sigma$, which is a symmetry number.  It is 1 for the heteronuclear dimer *RB*, and 2 for the homonuclear dimers *RR* and *BB*.  It is needed to account for the fact that in homonuclear dimers, the configuration obtained when the two atoms exchange positions is is indistinguishable from the original; the sum over states counts both and so must be reduced by 2 to compensate for the double counting.

The standard-state enthalpy and entropy can be evaluated using the thermodynamic relations

$$
h^0_i = \left (\frac{d(\frac{\mu^0_i}{kT})}{d(\frac{1}{kT})}\right ),  s^0_i = \left (\frac{d\mu^0_i}{dT}\right )
$$



For the monomeric species these are zero.  For the dimer

$$
h^0_{dimer} = \varepsilon
$$


$s^0_{dimer} = k \ln \left [\pi\sigma^2(1-\kappa^2)/\sum \right ]$


Thus, through variation of dimer potential parameters $\varepsilon$ and $\kappa$ we can adjust independently the standard enthalpy and entropy of the reactions in this system.